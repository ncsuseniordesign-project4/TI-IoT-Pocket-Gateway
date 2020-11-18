
import os
import time 

def main():
    scan_cmd = 'echo -ne "AT+COPS=?\r\n" > /dev/ttyO4'
    while True:
        print('Scanning...')
        os.system(scan_cmd)
        time.sleep(3)
main()