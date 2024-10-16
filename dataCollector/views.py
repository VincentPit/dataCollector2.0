from rest_framework import status
from rest_framework.response import Response
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import View
from django.core.paginator import Paginator
from django.conf import settings
from django.http import JsonResponse
import os
import requests
import json
import re
import logging


DOWNLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dataset')

# Ensure the directory exists
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


# Register API
@api_view(['POST'])
@permission_classes([AllowAny]) 
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'message': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'message': 'User already exists!'}, status=status.HTTP_400_BAD_REQUEST)
    
    User.objects.create_user(username=username, password=password)
    return Response({'message': 'User created successfully!'}, status=status.HTTP_201_CREATED)

# Login API
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'message': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user is not None:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    
    return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Protected View API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({'message': 'This is a protected view!'}, status=status.HTTP_200_OK)

# Validate Link API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_link(request):
    link = request.data.get('link')
    
    if not link:
        return Response({'message': 'Link is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        response = requests.get(link)
        if response.headers['Content-Type'] == 'application/json':
            return Response({'message': 'Valid JSON link.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'The link does not point to a JSON file.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': 'Failed to validate the link.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def download_link(request):
    link = request.data.get('link')

    if not link:
        return Response({'message': 'Link is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Download the JSON file
        response = requests.get(link, stream=True)
        if response.status_code == 200:
            filename = link.split("/")[-1]  # Use the file name from the link
            table_name = re.sub(r'\W+', '_', filename)  # Sanitize table name (remove non-alphanumeric characters)
            file_path = os.path.join(DOWNLOAD_DIR, filename)
            
            # Save the file
            with open(file_path, 'wb') as out_file:
                out_file.write(response.content)

            # Load JSON data
            with open(file_path, 'r') as json_file:
                data = json.load(json_file)
            
            # Check if data is a list of items
            if isinstance(data, list) and data:
                # Create a table for the new dataset
                create_table_for_dataset(table_name, data[0])
                create_table_for_dataset(table_name+"_modify", data[0])
                
                # Insert each item into the table
                for idx, entity in enumerate(data):
                    insert_item_into_table(table_name, idx, entity)

            return Response({'message': 'Download and insertion completed successfully!'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Failed to download the file.'}, status=status.HTTP_400_BAD_REQUEST)
    except json.JSONDecodeError:
        print(f"ERROR: Failed to decode JSON from the file at {file_path}")
        return Response({'message': 'Failed to decode JSON data.'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"ERROR: An error occurred: {str(e)}")
        return Response({'message': f'Failed to process the download: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def create_table_for_dataset(table_name, sample_item):
    # Build a SQL query to create a table dynamically
    columns = []
    for key, value in sample_item.items():
        sanitized_key = re.sub(r'\W+', '_', key)  # Sanitize column name
        if isinstance(value, int):
            columns.append(f"{sanitized_key} INTEGER")
        elif isinstance(value, float):
            columns.append(f"{sanitized_key} REAL")
        else:
            columns.append(f"{sanitized_key} TEXT")
    
    # Primary key column for unique ID
    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS {table_name} (
        id INTEGER PRIMARY KEY,
        {', '.join(columns)}
    );
    """

    # Execute the SQL query
    with connection.cursor() as cursor:
        cursor.execute(create_table_query)


def insert_item_into_table(table_name, item_id, item_data):
    # Convert item data into columns and values
    sanitized_columns = ', '.join([re.sub(r'\W+', '_', key) for key in item_data.keys()])
    
    # Create placeholders and prepare values for the insert query
    
    """for key,value in item_data.items():
        print(key,":", value)
    print("length:", len(item_data))"""
    placeholders = ', '.join(['%s'] * (len(item_data))) 
    values = [item_id]  # Start with the item_id
    for value in item_data.values():
        if isinstance(value, list):
            # Convert list to JSON string
            values.append(json.dumps(value))  
        else:
            values.append(value)

    # Insert query
    insert_query = f"""
    INSERT INTO {table_name} (id, {sanitized_columns}) VALUES (%s, {placeholders});
    """
    
    # Print debug information
    print(f"Insert Query: {insert_query}")
    print(f"Values: {values}")

    # Execute the insertion with raw SQL
    with connection.cursor() as cursor:
        cursor.execute(insert_query, values)

@api_view(['GET'])
def dataset_choices(request):
    try:
        with connection.cursor() as cursor:
            # Query to select only tables whose names end with 'json'
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%_json';")
            tables = cursor.fetchall()
        
        # Convert table names to a flat list
        tables = [table[0] for table in tables]

        return Response({'datasets': tables}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
logger = logging.getLogger(__name__)

@api_view(['GET'])
def modified_dataset_choices(request):
    try:
        with connection.cursor() as cursor:
            # Query to select only tables whose names end with 'json'
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%_json_modify';")
            tables = cursor.fetchall()
        
        # Convert table names to a flat list
        tables = [table[0] for table in tables]

        return Response({'datasets': tables}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
logger = logging.getLogger(__name__)

class DatasetItemsView(View):
    def get(self, request, dataset_id):
        table_name = dataset_id  # Use dataset_id as the table name

        # Check if the table exists
        if not self.table_exists(table_name):
            logger.error("Dataset table not found.")
            return JsonResponse({"error": "Dataset not found."}, status=404)

        # Retrieve all items from the dataset (i.e., table)
        try:
            items = self.get_all_items_from_table(table_name)
        except Exception as e:
            logger.error(f"Failed to retrieve items from table {table_name}: {str(e)}")
            return JsonResponse({"error": "Failed to retrieve items."}, status=500)

        # Handle pagination
        page_size = int(request.GET.get('page_size', 10))  # Default page size is 10
        page = int(request.GET.get('page', 1))  # Default to page 1
        logger.debug(f"Paginating items: page_size={page_size}, page={page}")

        paginator = Paginator(items, page_size)

        try:
            paginated_items = paginator.page(page)
        except (EmptyPage, PageNotAnInteger):
            logger.error("Requested page not found.")
            return JsonResponse({"error": "Page not found."}, status=404)

        # Return paginated data
        response_data = {
            "items": list(paginated_items),  # Convert to list to ensure safe JSON response
            "current_page": paginated_items.number,
            "total_pages": paginator.num_pages,
        }
        logger.debug(f"Returning paginated data: {response_data}")
        return JsonResponse(response_data, status=200)

    def table_exists(self, table_name):
        """ Check if a table exists in the database """
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT 1 
                    FROM information_schema.tables 
                    WHERE table_name = %s
                );
            """, [table_name])
            return cursor.fetchone()[0]

    def get_all_items_from_table(self, table_name):
        """ Retrieve all items from the specified table """
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT * FROM {table_name}")
            columns = [col[0] for col in cursor.description]  # Get column names
            rows = cursor.fetchall()
        
        # Convert rows to dicts
        items = [dict(zip(columns, row)) for row in rows]
        return items

class DatasetItemDetailView(View):
    def get(self, request, dataset_id, item_id):
        table_name = dataset_id  # Use dataset_id as the table name

        # Check if the table exists
        if not self.table_exists(table_name):
            logger.error("Dataset table not found.")
            return JsonResponse({"error": "Dataset not found."}, status=404)

        # Retrieve the item by ID
        try:
            item = self.get_item_by_id(table_name, item_id)
            if not item:
                logger.warning("Item not found with the provided item ID.")
                return JsonResponse({"error": "Item not found."}, status=404)
        except Exception as e:
            logger.error(f"Failed to retrieve item from table {table_name}: {str(e)}")
            return JsonResponse({"error": "Failed to retrieve item."}, status=500)

        logger.debug(f"Item found: {item}")
        return JsonResponse(item, safe=False)

    def table_exists(self, table_name):
        """ Check if a table exists in the database """
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT 1 
                    FROM information_schema.tables 
                    WHERE table_name = %s
                );
            """, [table_name])
            return cursor.fetchone()[0]

    def get_item_by_id(self, table_name, item_id):
        """ Retrieve a single item by ID from the specified table """
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT * FROM {table_name} WHERE id = %s", [item_id])
            row = cursor.fetchone()
            if row is None:
                return None
            
            columns = [col[0] for col in cursor.description]  # Get column names
            return dict(zip(columns, row))

class EditDatasetItemView(View):
    def get(self, request, dataset_id, item_id):
        table_name = dataset_id

        # Check if the table exists
        if not self.table_exists(table_name):
            logger.error("Dataset table not found.")
            return JsonResponse({"error": "Dataset not found."}, status=404)

        # If there are query parameters, treat it as an update request
        if request.GET:
            return self.handle_update(request, table_name, item_id)

        # Retrieve the item by ID
        try:
            item = self.get_item_by_id(table_name, item_id)
            if not item:
                logger.warning("Item not found with the provided item ID.")
                return JsonResponse({"error": "Item not found."}, status=404)
        except Exception as e:
            logger.error(f"Failed to retrieve item from table {table_name}: {str(e)}")
            return JsonResponse({"error": "Failed to retrieve item."}, status=500)

        logger.debug(f"Item found: {item}")
        return JsonResponse(item, safe=False)

    def handle_update(self, request, table_name, item_id):        
        # Parse the request GET parameters for modified data
        modified_data = request.GET.dict()  # Get query parameters as a dictionary

        # Start a database transaction
        with connection.cursor() as cursor:
            try:
                # Delete the original item from the table
                cursor.execute(f"DELETE FROM {table_name} WHERE id = %s", [item_id])

                # Insert the modified item into the modified table
                columns = ', '.join(modified_data.keys())
                placeholders = ', '.join(['%s'] * len(modified_data))
                values = list(modified_data.values())

                # Use the modified table name
                modified_table_name = f"{table_name}_modify" if "_modify" not in table_name else table_name
                
                cursor.execute(f"INSERT INTO {modified_table_name} ({columns}) VALUES ({placeholders})", values)

            except Exception as e:
                logger.error(f"Failed to modify item in {table_name}: {str(e)}")
                return JsonResponse({"error": "Failed to modify item."}, status=500)

        return JsonResponse({"message": "Item modified and saved successfully."}, status=200)

    def table_exists(self, table_name):
        """ Check if a table exists in the database """
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT 1 
                    FROM information_schema.tables 
                    WHERE table_name = %s
                );
            """, [table_name])
            return cursor.fetchone()[0]

    def get_item_by_id(self, table_name, item_id):
        """ Retrieve a single item by ID from the specified table """
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT * FROM {table_name} WHERE id = %s", [item_id])
            row = cursor.fetchone()
            if row is None:
                return None
            
            columns = [col[0] for col in cursor.description]  # Get column names
            return dict(zip(columns, row))