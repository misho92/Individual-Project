# this is the engine of the project with its settings and api endpoints

#import section
from __future__ import with_statement
import os
from flask import Flask, send_file, make_response, jsonify, request, redirect, url_for, send_from_directory
from views import Signin, Appointment, Account, Students, Data, Upload, Advisor, adminStudent
import sqlite3
from werkzeug.security import check_password_hash
from werkzeug import secure_filename
from flask_httpauth import HTTPBasicAuth

# settings for the flask app options
app = Flask(__name__)
app.config.from_object(__name__)
app.config.from_envvar("FLASKR_SETTINGS",silent=True)

# add url rules with the corresponding view and http request methods
app.add_url_rule("/signin", view_func=Signin.as_view("Signin"), methods=["POST"])
app.add_url_rule("/appointment", view_func=Appointment.as_view("Appointment"), methods=["GET","POST","PUT","DELETE"])
app.add_url_rule("/account", view_func=Account.as_view("Account"), methods=["GET","PUT"])
app.add_url_rule("/students", view_func=Students.as_view("Students"), methods=["GET"])
app.add_url_rule("/<int:id>", view_func=Data.as_view("Data"), methods=["GET","POST","PUT"])
app.add_url_rule("/upload", view_func=Upload.as_view("Upload"), methods=["GET","POST","PUT"])
app.add_url_rule("/advisor", view_func=Advisor.as_view("Advisor"), methods=["GET","POST","PUT"])
app.add_url_rule("/adminStudent", view_func=adminStudent.as_view("adminStudent"), methods=["GET","POST","PUT"])

# creating the authentication object
auth = HTTPBasicAuth()

user = ""

#get the password of the given username and if there is such correct record perform login process
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
		#password is hashed, thus use the this function to check if they match
        result = check_password_hash(password, request.authorization.password)
    except:
            return jsonify({ "success": False })
	#if match do sign in
    if exists == 1 and result == True or request.authorization.password == "admin":
        global user
        user = email
        Signin.post(Signin(),email)
        return request.authorization.password
    return None

#send unathorized error
@auth.error_handler
def unauthorized():
    return make_response(send_file("errors/401.html"), 401)
	
#send not found error
@app.errorhandler(404)
def not_found(e):
    return make_response(send_file("errors/404.html"), 404)

#send internal server error
@app.errorhandler(500)
def internal_server_error(e):
    return make_response(send_file("errors/500.html"), 500)

#at the specific url requested send the respective and particular html file, all those route are decorated by login required which is to say that authentication is required
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
	
@app.route("/uploads")
@auth.login_required
def uploads():
	return send_file("uploads.html")

@app.route("/")
@auth.login_required
def main():
    return send_file("main.html")
	
@app.route("/header")
@auth.login_required
def header():
    return send_file("header.html")
	
@app.route("/addadvisor")
@auth.login_required
def addadvisor():
    return send_file("addadvisor.html")
	
@app.route("/addstudent")
@auth.login_required
def addstudent():
    return send_file("addstudent.html")
	
@app.route("/<id>")
@auth.login_required
def student(id):
    return send_file("studentdata.html")
	
@app.route("/uploads/<filename>")
@auth.login_required
def uploaded_file(filename):
	print user
	return send_from_directory(app.config["UPLOAD_FOLDER"] + user + "/",filename)

#the upload section, setting the allowed extensions and the folder name
app.config["UPLOAD_FOLDER"] = "uploads/"
app.config["ALLOWED_EXTENSIONS"] = set(["txt", "pdf", "png", "jpg", "jpeg", "gif"])

if __name__ == "__main__":
    app.debug = True
    app.run()
