from flask import Flask, jsonify
from flask import render_template
from flask import request, redirect
import numpy as np
import psycopg2
import json
import requests
import geojson
import shapely.wkt
#import pandas as pd
import sys
import geopandas as gpd
#import folium
#from IPython.display import display
from shapely.geometry import Point
#import pygeos
from tabulate import tabulate
import logging
from shapely.geometry import shape, mapping


app = Flask(__name__)

# Configuring logging
logging.basicConfig(filename='app.log', level=logging.DEBUG)
f = open("app.log", "a")
f.truncate()
f.close()



def get_all_data():
    connection = psycopg2.connect(database="peaks_fr", user="postgres", password="postgresql", host="localhost", port=5432)
    cursor = connection.cursor()
    cursor.execute("""select json_build_object('type', 'FeatureCollection','features', json_agg(ST_AsGeoJSON( peaks_corsica_light.*)::json )) as geojson 
    from peaks_corsica_light where ele is not null""")
    
    return cursor

    
@app.route('/')
def index():
    cursor = get_all_data()
    markers=cursor.fetchall()

    print('markers', markers)

    return render_template("Accueil.html", markers=markers)





@app.route('/Qui-sommes-nous')
def qui_sommes_nous():
    return render_template("Qui-sommes-nous.html")

@app.route('/A-propos')
def a_propos():
    return render_template("A-propos.html")

@app.route('/Tutoriel')
def tuto():
    return render_template("Tutoriel.html")


if __name__ == '__main__':
    app.run(debug=True)