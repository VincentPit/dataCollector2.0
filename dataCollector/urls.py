from django.urls import path
from .views import (
    register,
    login,
    protected_view,
    get_paginated_qa_zre,
    get_paginated_counterfacts,
    get_unmodified_qa_zre,
    get_unmodified_counterfacts,
    get_modified_qa_zre,
    get_modified_counterfacts,
)

urlpatterns = [
    path('api/register/', register, name='register'),
    path('api/login/', login, name='login'),
    path('api/protected/', protected_view, name='protected_view'),
    
    # Paginated QA_ZRE records
    path('api/qa_zre/', get_paginated_qa_zre, name='get_paginated_qa_zre'),
    path('api/qa_zre/unmodified/', get_unmodified_qa_zre, name='get_unmodified_qa_zre'),
    path('api/qa_zre/modified/', get_modified_qa_zre, name='get_modified_qa_zre'),

    # Paginated Counterfact records
    path('api/counterfacts/', get_paginated_counterfacts, name='get_paginated_counterfacts'),
    path('api/counterfacts/unmodified/', get_unmodified_counterfacts, name='get_unmodified_counterfacts'),
    path('api/counterfacts/modified/', get_modified_counterfacts, name='get_modified_counterfacts'),
]
