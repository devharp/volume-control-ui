import threading
from flask import Flask, Response, request
from flask_socketio import SocketIO, emit


app = Flask(__name__)
app.config['SECRET KEY'] = 'password_harp'
sockio = SocketIO(app)

@app.route('/')
def home_page():
    page = '''<html>
    <head><title>Volume Detect Test</title></head>
    <body>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js" integrity="sha512-q/dWJ3kcmjBLU4Qc47E4A9kTB4m3wuTY7vkFJDTZKjTs8jhyGQnaUrxa0Ytd0ssMZhbNua9hE+E7Qv1j+DyZwA==" crossorigin="anonymous"></script>
    <script type="text/javascript" charset="utf-8">
        var socket = io();
        
        socket.on('volume-changed', function(data) {
            console.log(data);
        });
</script>
    </body>
</html>'''
    #emit('volume-changed', 'Hello World!')
    return Response(bytes(page, 'utf-8'), mimetype='text/html')

@sockio.on('connect')
def connected(auth):
    print(request.sid + ' connected')

def volumeLevelListener():
    import subprocess, re, time
    old_volume = 0

    while(True):
        output = subprocess.run(['amixer', 'sget', 'Master'], stdout=subprocess.PIPE).stdout.decode('utf-8')
        volume = re.findall('(Playback .*?\[)(.*?)(\%\].*?\[.*?\].\[)(.*?)(\])', output)[0]
        if volume != old_volume:
            old_volume = volume
            print('Volume level: ' + volume[1] + '%' + ', state: ' + volume[3])
            # with sockio.:
            sockio.emit('volume-changed', {"level" : volume[1], "state" : volume[3]})
            
            # doThis(volume[1], volume[3])
        time.sleep(1)

def doThis(a, b):
            # pass
            emit('volume-changed', {"level" : a, "state" : b})

def main():
    volt = threading.Thread(target=volumeLevelListener)
    volt.start()
    sockio.run(app, port=8888)

if __name__ == '__main__':
    main()

