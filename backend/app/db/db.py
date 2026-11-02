import os
import uuid
from collections.abc import AsyncGenerator
from datetime import datetime

from dotenv import load_dotenv
from fastapi import Depends
from fastapi_users_db_sqlalchemy import (
    SQLAlchemyBaseUserTableUUID,
    SQLAlchemyUserDatabase,
)
from fastapi_users_db_sqlalchemy.generics import GUID
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    UniqueConstraint,
)
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://rag:ragpassword@localhost:5432/rag",
)


class Base(DeclarativeBase):
    pass


# Association tables ------------------------------------------------------------

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column(
        "user_id", GUID, ForeignKey("user.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "role_id", GUID, ForeignKey("role.id", ondelete="CASCADE"), primary_key=True
    ),
)

user_departments = Table(
    "user_departments",
    Base.metadata,
    Column(
        "user_id", GUID, ForeignKey("user.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "department_id",
        GUID,
        ForeignKey("department.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


# Models ------------------------------------------------------------------------

class Role(Base):
    __tablename__ = "role"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(
        String(80), unique=True, index=True, nullable=False
    )
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    users: Mapped[list["User"]] = relationship(
        secondary=user_roles, back_populates="roles"
    )

class Documents(Base):
    __tablename__ = "documents"
    
    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    doc_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    title:Mapped[str] = mapped_column(String(255) ,   nullable =False)
    department:Mapped[str] = mapped_column(String(255) , nullable =False)
    current_version:Mapped[int] = mapped_column(Integer() , nullable=False , default=1)
    created_at = Column(DateTime, default=datetime.now)
    updated_at =  Column(DateTime, default=datetime.now)

    documents_version = relationship("Documents_Version" ,back_populates="documents", cascade="all, delete-orphan")


class Documents_Version(Base):
    __tablename__ = "documents_version"

    __table_args__ = (
        UniqueConstraint(
            "doc_id",
            "version",
            name="uq_document_version"
        ),
    )
    
    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    doc_id:Mapped[str] = mapped_column(String(255),ForeignKey("documents.doc_id"), nullable=False)
    department:Mapped[str] = mapped_column(String(255) , nullable =False)
    version: Mapped[int] = mapped_column(Integer(), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    created_at = Column(DateTime, default=datetime.now)
      
    documents = relationship("Documents" ,back_populates="documents_version")


class Department(Base):
    __tablename__ = "department"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(
        String(120), unique=True, index=True, nullable=False
    )
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    users: Mapped[list["User"]] = relationship(
        secondary=user_departments, back_populates="departments"
    )


class User(SQLAlchemyBaseUserTableUUID, Base):
    roles: Mapped[list["Role"]] = relationship(
        secondary=user_roles, back_populates="users"
    )
    departments: Mapped[list["Department"]] = relationship(
        secondary=user_departments,
        back_populates="users",
        # Eagerly load departments whenever a User is loaded; lazy loading a
        # relationship raises MissingGreenlet in async context.
        lazy="selectin",
    )


class UserMemory(Base):
    """Key/value facts the AI learns about a user over time (Claude-style memory).

    ``department`` is the first key; additional facts can be added without a
    schema change.
    """

    __tablename__ = "user_memory"

    __table_args__ = (
        UniqueConstraint("user_id", "key", name="uq_user_memory_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    key: Mapped[str] = mapped_column(String(120), nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


# Engine / session --------------------------------------------------------------

engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def create_db_and_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
