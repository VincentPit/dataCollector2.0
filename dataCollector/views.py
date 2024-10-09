from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import QA_ZRE, Counterfact, ModifiedQA_ZRE, ModifiedCounterfact, ModificationHistory
from .serializers import QA_ZRESerializer, CounterfactSerializer, ModifiedQA_ZRESerializer, ModifiedCounterfactSerializer, ModificationHistorySerializer
from rest_framework.pagination import PageNumberPagination

# Custom pagination class
class CustomPagination(PageNumberPagination):
    page_size = 100  # Number of records per page
    page_size_query_param = 'page_size'  # Allow dynamic page size
    max_page_size = 500 
# Helper function for paginated responses
def get_paginated_response(request, queryset, serializer_class):
    paginator = CustomPagination()
    page_obj = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(page_obj, many=True)
    return paginator.get_paginated_response(serializer.data)

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

# Get paginated QA_ZRE records
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_paginated_qa_zre(request):
    return get_paginated_response(request, QA_ZRE.objects.all(), QA_ZRESerializer)

# Get paginated Counterfact records
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_paginated_counterfacts(request):
    return get_paginated_response(request, Counterfact.objects.all(), CounterfactSerializer)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unmodified_qa_zre(request):
    unmodified_records = ModifiedQA_ZRE.objects.filter(is_modified=False)  # Filter for unmodified records
    return get_paginated_response(request, unmodified_records, QA_ZRESerializer)

# Get unmodified Counterfact records
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unmodified_counterfacts(request):
    unmodified_records = ModifiedCounterfact.objects.filter(is_modified=False)  # Filter for unmodified records
    return get_paginated_response(request, unmodified_records, CounterfactSerializer)

# Get modified QA_ZRE records
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_modified_qa_zre(request):
    modified_records = ModifiedQA_ZRE.objects.filter(is_modified=True)  # Filter for modified records
    return get_paginated_response(request, modified_records, ModifiedQA_ZRESerializer)

# Get modified Counterfact records
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_modified_counterfacts(request):
    modified_records = ModifiedCounterfact.objects.filter(is_modified=True)  # Filter for modified records
    return get_paginated_response(request, modified_records, ModifiedCounterfactSerializer)

def log_modification(instance, user):
    def serialize_value(value):
        """Helper function to serialize values."""
        if isinstance(value, dict) or isinstance(value, list):
            return value  # Lists and dicts are already serializable
        if hasattr(value, 'id'):
            return value.id  # Use ID for related fields
        return str(value)  # Convert other types to string

    # Capture previous values before saving the instance
    previous_values = {field.name: serialize_value(getattr(instance, field.name)) for field in instance._meta.fields}

    # Save the updated instance
    instance.save()

    # Capture new values after saving
    new_values = {field.name: serialize_value(getattr(instance, field.name)) for field in instance._meta.fields}

    try:
        ModificationHistory.objects.create(
            modified_object=instance.__class__.__name__,
            object_id=instance.id,
            modified_by=user,
            previous_values=previous_values,
            new_values=new_values
        )
    except Exception as e:
        # Handle logging errors (e.g., log them or notify someone)
        print(f"Error logging modification: {e}")

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_counterfact(request, pk):
    print(f"Received PUT request for Counterfact with pk: {pk}")  # Debug statement

    try:
        counterfact = ModifiedCounterfact.objects.get(case_id=pk, is_modified=False)  # Fetch the record
        print(f"Found Counterfact: {counterfact}")  # Debug statement
    except ModifiedCounterfact.DoesNotExist:
        print(f"Counterfact with pk {pk} not found.")  # Debug statement
        return Response({'error': 'Counterfact not found'}, status=status.HTTP_404_NOT_FOUND)

    previous_values = {field.name: getattr(counterfact, field.name) for field in counterfact._meta.fields}  # Capture previous values
    print(f"Previous values: {previous_values}")  # Debug statement

    serializer = CounterfactSerializer(counterfact, data=request.data, partial=True)  # Allow partial updates

    if serializer.is_valid():
        serializer.save()  # Save updated record
        print(f"Updated values: {serializer.data}")  # Debug statement
        
        # Log modification
        log_modification(counterfact, request.user)  # Log the modification
        return Response(serializer.data, status=status.HTTP_200_OK)

    print(f"Serializer errors: {serializer.errors}")  # Debug statement
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_modification_history(request, object_id):
    history_records = ModificationHistory.objects.filter(object_id=object_id).order_by('-modification_time')
    serializer = ModificationHistorySerializer(history_records, many=True)  # You need to define a serializer for ModificationHistory
    return Response(serializer.data, status=status.HTTP_200_OK)

