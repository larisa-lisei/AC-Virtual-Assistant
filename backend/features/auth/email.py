from fastapi_mail import ConnectionConfig, MessageSchema, MessageType, FastMail
from pydantic_settings import BaseSettings, SettingsConfigDict

class EmailSettings(BaseSettings):
    MAIL_USERNAME: str 
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_SERVER: str 
    MAIL_PORT: int = 587
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    model_config = SettingsConfigDict(
        env_file='.env',
        extra='ignore'
    )

_settings = EmailSettings()

_mail_config = ConnectionConfig(
    MAIL_USERNAME=_settings.MAIL_USERNAME,
    MAIL_PASSWORD=_settings.MAIL_PASSWORD,
    MAIL_FROM=_settings.MAIL_FROM,
    MAIL_SERVER=_settings.MAIL_SERVER,
    MAIL_PORT=_settings.MAIL_PORT,
    MAIL_STARTTLS=_settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=_settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True
)

async def send_activation_email(email: str, activation_token: str):
    activation_link=f"http://localhost:5173/activate-account?token={activation_token}"

    message = MessageSchema(
        subject="Activate your AC Virtual Assistant Account",
        recipients=[email],
        body=f"""
            <h3>Welcome!</h3>
            <p>Your Ac Virtual Assistant account has been created.</p>
            <p>Click the link below to set your password and activate your account:</p>
            <a href="{activation_link}">Activate Account</a>
            <p>This link expires in 48 hours.</p>
        """,
        subtype=MessageType.html
    )

    await FastMail(_mail_config).send_message(message)
