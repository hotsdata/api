import sys
reload(sys)  # Reload is a hack
sys.setdefaultencoding('UTF8')
import time
import os
from os.path import join, dirname
from dotenv import load_dotenv
import datetime as dt
import psycopg2
import sys
import time
from elasticsearch import Elasticsearch, RequestsHttpConnection
from elasticsearch import helpers

es_host = os.environ.get("ES_HOST")

client = Elasticsearch([es_host], port=9200)
client.get(index='hotsdata', id='1')
