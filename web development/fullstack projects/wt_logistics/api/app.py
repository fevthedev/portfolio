from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import pandas as pd
import csv
import io
from io import StringIO
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from utils import process_csv, get_insights, serialize_shipment
from persistence import Shipment,init_db, SessionLocal, engine
import logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
# increasing max file limit for flask api to accommodate potentially large file upload
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024  # 64 MB

CORS(app, resources={r"/*": {"origins": "*"}})


init_db()

@app.route('/')
def hello():
    return jsonify({'message': 'Nothing to see here'})

@app.route('/upload-csv', methods=['POST'])
def upload_csv():
    # Check for attached file
    if 'file' not in request.files:
        app.logger.error('No file detected.')
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Process the file in chunks to reduce memory usage
    chunk_size = 1000
    processed_rows = 0
    session = SessionLocal()
    seen_ids = set()

    try:
        # Stream the file instead of loading entirely into memory
        stream = io.StringIO(file.stream.read().decode('UTF-8'), newline=None)
        csv_reader = csv.DictReader(stream)
        
        # Process and insert in batches
        for chunk in pd.read_csv(stream, chunksize=chunk_size):
            cleaned = process_csv(chunk)

            # Remove duplicates across chunks
            cleaned = cleaned[~cleaned['shipment_id'].isin(seen_ids)]
            seen_ids.update(cleaned['shipment_id'].unique())
            
            # Convert to list of dictionaries for faster processing
            records = cleaned.to_dict('records')
            
            shipments = []
            for row in records:
                try:
                    shipment = Shipment(
                        shipment_id=int(row['shipment_id']),
                        customer_id=int(row['customer_id']),
                        origin=row['origin'],
                        destination=row['destination'],
                        weight=int(row['weight']),
                        volume=int(row['volume']),
                        carrier=row['carrier'],
                        mode=row['mode'],
                        status=row['status'],
                        arrival_date=datetime.strptime(row['arrival_date'], "%Y-%m-%d"),
                        departure_date=datetime.strptime(row['departure_date'], "%Y-%m-%d") if pd.notna(row['departure_date']) else None,
                        delivered_date=datetime.strptime(row['delivered_date'], "%Y-%m-%d") if pd.notna(row['delivered_date']) else None
                    )
                    shipments.append(shipment)
                except (ValueError, KeyError) as e:
                    app.logger.warning(f"Skipping row due to error: {e}")
                    continue
            
            # batch insert
            if shipments:
                session.bulk_save_objects(shipments)
                session.commit()
                processed_rows += len(shipments)
        
        return jsonify({
            'success': True,
            'message': f'File processed successfully. {processed_rows} records processed.'
        }), 200

    except SQLAlchemyError as e:
        session.rollback()
        app.logger.error(f"Database error during upload: {str(e)}")
        return jsonify({'error': 'Database operation failed'}), 500
    except Exception as e:
        session.rollback()
        app.logger.error(f"Unexpected error during upload: {str(e)}")
        return jsonify({'error': 'File processing failed'}), 500
    finally:
        session.close()


@app.route('/shipments', methods=['GET'])
def get_shipments():
    session = SessionLocal()
    try:
        # obtain filter params
        destination = request.args.get('destination')
        mode = request.args.get('mode')
        carrier = request.args.get('carrier')
        status = request.args.get('status')

        query = session.query(Shipment)

        if destination:
            query = query.filter(Shipment.destination == destination)
        if mode:
            query = query.filter(Shipment.mode == mode)
        if carrier:
            query = query.filter(Shipment.carrier == carrier)
        if status:
            query = query.filter(Shipment.status == status)


        # adding support for pagination to optimize shipment data delivery
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))  # default to 50 per page
        offset = (page - 1) * per_page

        total = query.count()
        shipments = query.offset(offset).limit(per_page).all()

        return jsonify({
            "data": [serialize_shipment(s) for s in shipments],
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": (total + per_page - 1)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e), 'message': 'Your request failed'}), 400
    finally:
        session.close()
            

    # df = DATA.get('shipments')
    # if df is None:
    #     return jsonify({'error': 'No data available'}), 400

    # return df.to_dict(orient='records')

@app.route('/shipments/<int:shipment_id>', methods=['GET'])
def get_shipment(shipment_id):
    session = SessionLocal()
    try:
        shipment = session.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
        if not shipment:
            return jsonify({'error': 'Shipment not found'}), 404
        return jsonify(serialize_shipment(shipment)), 200
    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()

@app.route('/shipments/export', methods=['GET'])
def export_shipments():
    # faciliates the export of filtered results as csv

    session = SessionLocal()
    try:
        # Get filter parameters
        destination = request.args.get('destination')
        mode = request.args.get('mode')
        carrier = request.args.get('carrier')
        status = request.args.get('status')

        query = session.query(Shipment)
        filename_prefix = ''

        if destination:
            query = query.filter(Shipment.destination == destination)
            filename_prefix += f'{destination.lower()}_'
        if mode:
            query = query.filter(Shipment.mode == mode)
            filename_prefix += f'{mode.lower()}_'
        if carrier:
            query = query.filter(Shipment.carrier == carrier)
            filename_prefix += f'{carrier.lower()}_'
        if status:
            query = query.filter(Shipment.status == status)
            filename_prefix += f'{status.lower()}_'

        output = StringIO()
        writer = csv.writer(output)

        # Write headers
        writer.writerow([
            'shipment_id', 'customer_id', 'origin', 'destination',
            'weight', 'volume', 'carrier', 'mode', 'status',
            'arrival_date', 'departure_date', 'delivered_date'
        ])

        for s in query.all():
            writer.writerow([
                s.shipment_id, s.customer_id, s.origin, s.destination,
                s.weight, s.volume, s.carrier, s.mode, s.status,
                s.arrival_date, s.departure_date, s.delivered_date
            ])

        output.seek(0)
        return Response(
            output,
            mimetype='text/csv',
            headers={"Content-Disposition": f"attachment;filename=shipments_{filename_prefix}export.csv"}
        )
    finally:
        session.close()

@app.route('/insights', methods=['GET'])
def insights():
    try:
        session = SessionLocal()
        query = session.query(Shipment).statement
        df = pd.read_sql(query, con=engine)
        return jsonify(get_insights(df)), 200
    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e), 'message': 'Your request failed'}), 400
    finally:
        session.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000,debug=True)

