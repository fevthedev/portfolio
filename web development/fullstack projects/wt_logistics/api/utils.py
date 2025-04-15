import pandas as pd

CAPACITY_CM3 = 60_000_000_000


def serialize_shipment(shipment):
    # strips SQLAlchemy _sa_instance_state from shipment results
    d = shipment.__dict__.copy()
    d.pop('_sa_instance_state', None)
    return d

def process_csv(df):
    df = df.copy()
    
    # remove duplicates shipments and drop shipments with no weight/volume records
    df = df.drop_duplicates(subset='shipment_id')
    df = df.dropna(subset=['volume', 'weight'])

    return df

def get_insights(df):

    # provide total shipments
    total_shipments = len(df)
    
    # provide on time and delayed deliveries

    # assuming an ontime delivery is a shipment where delivery date - arrival date > 5 days
    delivered_df = df[df['status'] == 'delivered'].copy()
    
    # Calculate the number of days between arrival and delivered
    delivered_df['delivery_delta'] = (delivered_df['delivered_date'] - delivered_df['arrival_date']).dt.days
    delivered_df['delivered_on_time'] = delivered_df['delivery_delta'] <= 5

    delivered_on_time = delivered_df['delivered_on_time'].sum()
    delivered_delayed = len(delivered_df) - delivered_on_time

    # provide warehouse usage rate

    # assuming volume of shipments refers to shipments with status = received (still at warehouse)
    # assuming intransit and delivered shipments are no longer being stored in warehouse
    received_shipments = df[df['status'] == 'received']
    warehouse_usage = round(received_shipments['volume'].sum() / CAPACITY_CM3 * 100, 2)


    # Calculate received count per carrier per day for bar chart
    received_grouped = df[df['status'] == 'received'].groupby(['arrival_date', 'carrier']).size().unstack(fill_value=0)

    # formatting it for frontend
    received_per_carrier_per_day = {
        date.strftime('%Y-%m-%d'): row.dropna().to_dict()
        for date, row in received_grouped.iterrows()
    }

    # Calculate shipment volume by mode for Pie Chart
    volume_by_mode = df.groupby('mode')['volume'].sum().to_dict()

    # Calculate packages per day for Line Chart - based on arrival date
    packages_per_day = df.groupby('arrival_date').size()
    packages_per_day = {
        date.strftime('%Y-%m-%d'): int(count)
        for date, count in packages_per_day.items()
    }


    return {
        'total_shipments': total_shipments,
        'delivered_on_time': int(delivered_on_time),
        'delivered_delayed': int(delivered_delayed),
        'warehouse_utilization': warehouse_usage,
        "received_per_carrier_per_day": received_per_carrier_per_day,
        "volume_by_mode": volume_by_mode,
        "packages_per_day": packages_per_day,
    }

