import threading
from flask import Flask, Response, request
from flask_socketio import SocketIO, emit


app = Flask(__name__)
app.config['SECRET KEY'] = 'password_harp'
sockio = SocketIO(app)

@app.route('/')
def home_page():
    return Response(open('./index.html', 'rb'), mimetype='text/html')

@app.route('/fonts/Roboto.css')
def font():
    return Response(open('./fonts/Roboto.css', 'rb'), mimetype='text/css')

@app.route('/style.css')
def style():
    return Response(open('./style.css', 'rb'), mimetype='text/css')

@app.route('/libs/progressbar.min.js')
def progBarCss():
    return Response(open('./libs/progressbar.min.js', 'rb'), mimetype='text/javascript')

@app.route('/libs/progressbar.min.js.map')
def progBarCssMap():
    return Response(open('./libs/progressbar.min.js.map', 'rb'), mimetype='application/json')
    
@app.route('/script.js')
def script():
    return Response(open('./script.js', 'rb'), 'text/javascript')

@sockio.on('connect')
def connected(auth):
    print(request.sid + ' connected')

@sockio.on('change-volume')
def changeVolume(data):
    print('\nRequest from client to set volume to:' + str(data) + '\n\n')
    import subprocess
    subprocess.run(['amixer', 'sset', 'Master', data['num']], stdout=subprocess.PIPE)

def volumeLevelListener():
    import subprocess, re, time

    while(True):
        output = subprocess.run(['amixer', 'sget', 'Master'], stdout=subprocess.PIPE).stdout.decode('utf-8')
        volume = re.findall('(Playback .*?\[)(.*?)(\%\].*?\[.*?\].\[)(.*?)(\])', output)[0]
        sockio.emit('volume-changed', {"level" : volume[1], "state" : volume[3]})
        time.sleep(1)

def main():
    volt = threading.Thread(target=volumeLevelListener)                     # Volume Thread
    volt.start()
    sockio.run(app, port=8888, host='0.0.0.0')

if __name__ == '__main__':
    main()

