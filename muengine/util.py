import json

LOGGER_SCRIPT = open("muengine/logger.js", "r").read()


def load_logger_script(): return LOGGER_SCRIPT


def respond_with_error(**kwargs):
    status_code = kwargs.get("status_code", 400)
    payload = kwargs.get("payload", None)
    content_type = kwargs.get("content_type", "application/json")

    return gen_response("error", status_code, payload, content_type)

def respond_with_success(**kwargs):
    status_code = kwargs.get("status_code", 201)
    payload = kwargs.get("payload", None)
    content_type = kwargs.get("content_type", "application/json")

    return gen_response("success", status_code, payload, content_type)


def gen_response(status_name, status_code : int, payload : dict = None, content_type : str = "application/json"):

    response = {"status": status_name}
    if payload: response["data"] = payload

    return json.dumps(response), status_code, {"Content-Type": content_type}
