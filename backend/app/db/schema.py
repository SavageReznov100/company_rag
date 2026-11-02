import uuid

from fastapi_users import schemas
from pydantic import BaseModel, ConfigDict, Field


class QueryRequest(BaseModel):
    """Body for ``POST /query``: a search query plus optional metadata filters."""

    query: str = Field(min_length=1, max_length=2000)
    doc_id: str | None = None
    department: str | None = None


class QueryResult(BaseModel):
    page_content: str
    metadata: dict


class QueryResponse(BaseModel):
    results: list[QueryResult]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    """Body for ``POST /chat``.

    ``messages`` is the full conversation history (preferred); ``message``
    is kept for backward compatibility with a single-turn payload.
    ``conversation_id`` identifies the client-side conversation the
    messages belong to.
    """

    messages: list[ChatMessage] | None = None
    message: str | None = Field(default=None, max_length=2000)
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    messages: list[ChatMessage]
    next_node: str | None = None


class DocumentCreate(BaseModel):
    doc_id:str
    current_version:int
    title:str
    department:str

class DocumentRead(BaseModel):
    id:int
    doc_id:str
    current_version:int
    title:str
    department:str



class DocumentUpdate(BaseModel):  
    doc_id:str
    current_version:int 


class Document_VersionCreate(BaseModel):   
    doc_id:str
    current_version:int
    department:str


class Document_VersionRead(BaseModel):
    id:int
    doc_id:str
    version:int
    department:str


class Document_VersionUpdate(BaseModel):
    doc_id:str
    version:int




class RoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None = None


class RoleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: str | None = None


class DepartmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None = None


class DepartmentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None


class UserRead(schemas.BaseUser[uuid.UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass


class UserAdminRead(BaseModel):
    id: uuid.UUID
    email: str
    is_active: bool
    is_superuser: bool
    is_verified: bool
    roles: list[str] = []
    departments: list[str] = []
