import boto3
from botocore.exceptions import ClientError
from config import Config

def send_sms(phone_e164: str, message: str):
    """
    Uses AWS SNS Publish. Phone must be E.164 format.
    """
    client = boto3.client(
        "sns",
        region_name=Config.AWS_REGION,
        aws_access_key_id=Config.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=Config.AWS_SECRET_ACCESS_KEY,
    )

    attrs = {
        "AWS.SNS.SMS.SenderID": {"DataType": "String", "StringValue": Config.AWS_SNS_SENDER_ID},
        "AWS.SNS.SMS.SMSType": {"DataType": "String", "StringValue": "Transactional"},
    }

    try:
        return client.publish(
            PhoneNumber=phone_e164,
            Message=message,
            MessageAttributes=attrs,
        )
    except ClientError as e:
        raise RuntimeError(f"AWS SNS error: {e}")
