# this is the engine of the project with its settings and api endpoints

from __future__ import with_statement
from flask import Flask, send_file, make_response,jsonify,request
from views import Signin, Appointment, Account, Students, Data
import sqlite3
from werkzeug.security import check_password_hash
from flask_httpauth import HTTPBasicAuth

# set flask app options
app = Flask(__name__)
app.config.from_object(__name__)
app.config.from_envvar("FLASKR_SETTINGS",silent=True)


# add url rules with the corresponding view and method
app.add_url_rule("/signin", view_func=Signin.as_view("Signin"), methods=["POST"])
app.add_url_rule("/appointment", view_func=Appointment.as_view("Appointment"), methods=["GET","POST","PUT","DELETE"])
app.add_url_rule("/account", view_func=Account.as_view("Account"), methods=["GET","PUT"])
app.add_url_rule("/students", view_func=Students.as_view("Students"), methods=["GET"])
app.add_url_rule("/<int:id>", view_func=Data.as_view("Data"), methods=["GET","POST","PUT"])

# make_response(open("index.html").read()) for no caching

auth = HTTPBasicAuth()

@auth.get_password
def get_password(email):
    conn = sqlite3.connect("Project.sqlite")
    c = conn.cursor()
    try:
        c.execute("SELECT COUNT(*) FROM user WHERE email = ? ", (email,))
        exists = c.fetchone()[0]
        c.execute("SELECT email FROM user WHERE email = ? ", (email,))
        email = c.fetchone()[0]
        c.execute("SELECT password FROM user WHERE email = ? ", (email,))
        password = c.fetchone()[0]
        if password == request.authorization.password:
            result = True
        #c.execute("SELECT id FROM user WHERE email = ? ", (email,))
        #id = c.fetchone()[0]
    except:
            return jsonify({ "success": False })
    if exists == 1 and result == True:
        Signin.post(Signin(),email)
        return request.authorization.password
    return None

@auth.error_handler
def unauthorized():
    return make_response(send_file("errors/401.html"), 401)
	
@app.errorhandler(404)
def not_found(e):
    return make_response(send_file("errors/404.html"), 404)
	
@app.errorhandler(500)
def internal_server_error(e):
    return make_response(send_file("errors/500.html"), 500)

@app.route("/appointments")
@auth.login_required
def appointments():
    return send_file("appointments.html")
	
@app.route("/myaccount")
@auth.login_required
def account():
    return send_file("account.html")

@app.route("/signout")
def signout():
	return send_file("signout.html")

@app.route("/")
@auth.login_required
def main():
    return send_file("main.html")
	
@app.route("/header")
@auth.login_required
def header():
    return send_file("header.html")
	
@app.route("/<id>")
@auth.login_required
def student(id):
    return send_file("studentdata.html")

if __name__ == "__main__":
    app.debug = True
    app.run()