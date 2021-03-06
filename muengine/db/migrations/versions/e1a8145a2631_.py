"""empty message

Revision ID: e1a8145a2631
Revises: 
Create Date: 2019-02-08 12:46:58.702857

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e1a8145a2631'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('visits',
    sa.Column('id', sa.BigInteger(), nullable=False),
    sa.Column('baseURI', sa.String(), nullable=True),
    sa.Column('URL', sa.String(), nullable=True),
    sa.Column('domain', sa.String(), nullable=True),
    sa.Column('referrer', sa.String(), nullable=True),
    sa.Column('navigation_start', sa.DateTime(), nullable=True),
    sa.Column('user_agent', sa.String(), nullable=True),
    sa.Column('screen_height', sa.Integer(), nullable=True),
    sa.Column('screen_width', sa.Integer(), nullable=True),
    sa.Column('initial_window_height', sa.Integer(), nullable=True),
    sa.Column('initial_window_width', sa.Integer(), nullable=True),
    sa.Column('inserted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('events',
    sa.Column('visit_id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.Float(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('payload', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('inserted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['visit_id'], ['visits.id'], ),
    sa.PrimaryKeyConstraint('visit_id', 'timestamp', 'name')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('events')
    op.drop_table('visits')
    # ### end Alembic commands ###
