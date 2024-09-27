from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import QA_ZRE, Counterfact, ModifiedQA_ZRE, ModifiedCounterfact
from .serializers import QA_ZRESerializer, CounterfactSerializer, ModifiedQA_ZRESerializer, ModifiedCounterfactSerializer
from rest_framework.pagination import PageNumberPagination

# Custom pagination class
class CustomPagination(PageNumberPagination):
    page_size = 100  # Number of records per page
    page_size_query_param = 'page_size'  # Allow dynamic page size
    max_page_size = None  # No maximum page size

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