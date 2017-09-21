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
import boto3
from aws_requests_auth.aws_auth import AWSRequestsAuth
from elasticsearch import Elasticsearch, RequestsHttpConnection
from elasticsearch import helpers
from aws_requests_auth import boto_utils

dotenv_path = join(dirname(__file__), '../.env')
load_dotenv(dotenv_path)

DB_HOST = os.environ.get("DB_HOST")
DB_DB = os.environ.get("DB_DB")
DB_USER = os.environ.get("DB_USER")
DB_PASS = os.environ.get("DB_PASS")

es_host = os.environ.get("ES_HOST")

# use the requests connection_class and pass in our custom auth class
es_client = Elasticsearch([es_host], port=9200)

query = ('SELECT  player_id, split_part(battletag, \'#\', 1) as name, toonhandle, '
'  case split_part(toonhandle, \'-\', 1) when \'1\' then \'NA\' when \'2\' THEN \'EU\' when \'3\' then \'KR\' when \'5\' then \'CN\' end as region '
'FROM battletag_toonhandle_lookup '
'WHERE battletag != \'\' '
'ORDER BY player_id '
'LIMIT %s '
'OFFSET %s')

conn = psycopg2.connect(host=DB_HOST,database=DB_DB, user=DB_USER, password=DB_PASS)
cur = conn.cursor()

offset = 0
limit = 1000
numrecords = 1110000
while offset < numrecords:
  cur.execute(query, (limit, offset))
  actions = []
  for rec in cur:
    action = {
      "_index": "hotsdata",
      "_type": "user",
      "_id": rec[0],
      "_source": {
        "player_id": rec[0],
        "name": rec[1],
        "toonhandle": rec[2],
        "region": rec[3]
      }
    }
    print action
    actions.append(action)
  helpers.bulk(es_client, actions)
  time.sleep(10)
  offset += limit


cur.close()
conn.close()

print 'Finished'
