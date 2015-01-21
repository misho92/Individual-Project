# this file consists of several classes. Each of them has a couple of functions which corresponds to the rest calls and execute some database activities
# based on the rest verb used

from flask import request, jsonify
import sqlite3
import flask.views
import json
from werkzeug.security import generate_password_hash
from time import gmtime, strftime
import datetime
import time

userEmail = ""

class Appointment(flask.views.MethodView):

    def get(self):
		conn = sqlite3.connect("Project.sqlite")
		c = conn.cursor()
		c.execute("SELECT title,first_name FROM user WHERE email = ?", (userEmail,))
		username = c.fetchone()
		c.execute("SELECT date,venue,description FROM appointment WHERE email = ? ORDER BY date ASC", (userEmail,))
		apps = [dict(date=str(row[0]), venue=str(row[1]), description=str(row[2])) for row in c.fetchall()]
		return jsonify({
            "success": True,
            "username": username,
            "appointments": [{ "date": item["date"], "venue": item["venue"], "description": item["description"] } for item in apps]
        })
		
class Students(flask.views.MethodView):

    def get(self):
		conn = sqlite3.connect("Project.sqlite")
		c = conn.cursor()
		c.execute("SELECT title,first_name FROM user WHERE email = ?", (userEmail,))
		username = c.fetchone()
		c.execute("SELECT * FROM student WHERE advisor = ?", (userEmail,))
		students = [dict(id=str(row[0]), advisor=str(row[1]), first_name=str(row[2]), surname=str(row[3]), degree_type=str(row[6]), degree_course=str(row[5])) for row in c.fetchall()]
		return jsonify({
            "success": True,
            "username": username,
            "students": [{ "id": item["id"] + item["surname"][:1], "advisor": item["advisor"], "name": item["first_name"] + " " + item["surname"], "degree": item["degree_type"] + " " + item["degree_course"]} for item in students]
        })
		
class Data(flask.views.MethodView):

    def get(self,id=None):
		conn = sqlite3.connect("Project.sqlite")
		c = conn.cursor()
		c.execute("SELECT title,first_name FROM user WHERE email = ?", (userEmail,))
		username = c.fetchone()
		c.execute("SELECT first_name,surname FROM student WHERE id = ?", (id,))
		name = c.fetchone()
		c.execute("SELECT id,grade,credits,department FROM course WHERE student_id = ? AND year = 1", (id,))
		year1 = [dict(course=str(row[0]), grade=str(row[1]), credits=str(row[2]), department=str(row[3])) for row in c.fetchall()]
		c.execute("SELECT id,grade,credits,department FROM course WHERE student_id = ? AND year = 2", (id,))
		year2 = [dict(course=str(row[0]), grade=str(row[1]), credits=str(row[2]), department=str(row[3])) for row in c.fetchall()]
		c.execute("SELECT id,grade,credits,department FROM course WHERE student_id = ? AND year = 3", (id,))
		year3 = [dict(course=str(row[0]), grade=str(row[1]), credits=str(row[2]), department=str(row[3])) for row in c.fetchall()]
		c.execute("SELECT id,grade,credits,department FROM course WHERE student_id = ? AND year = 4", (id,))
		year4 = [dict(course=str(row[0]), grade=str(row[1]), credits=str(row[2]), department=str(row[3])) for row in c.fetchall()]
		return jsonify({
            "success": True,
            "username": username,
			"name": name,
			"year1": [{ "course": item["course"], "grade": item["grade"], "credits": item["credits"], "department": item["department"]} for item in year1],
            "year2": [{ "course": item["course"], "grade": item["grade"], "credits": item["credits"], "department": item["department"]} for item in year2],
			"year3": [{ "course": item["course"], "grade": item["grade"], "credits": item["credits"], "department": item["department"]} for item in year3],
			"year4": [{ "course": item["course"], "grade": item["grade"], "credits": item["credits"], "department": item["department"]} for item in year4]
        })

class Account(flask.views.MethodView):
	def get(self):
		conn = sqlite3.connect("Project.sqlite")
		c = conn.cursor()
		c.execute("SELECT title,first_name FROM user WHERE email = ?", (userEmail,))
		username = c.fetchone()
		c.execute("SELECT title,first_name,surname,department,number,DoB FROM user WHERE email = ?", (userEmail,))
		user = c.fetchone()
		return jsonify({
            "success": True,
			"username": username,
			"user": user
        })
		
class Signin(flask.views.MethodView):
    
    def post(self,email):
        global userEmail 
        userEmail = email
