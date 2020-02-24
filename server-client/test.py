# import midi
# from midi import MidiConnector
# from midi import ControlChange
# from midi import Message
# cc = ControlChange(100, 127)
# conn = MidiConnector('IAC Driver Bus 1')
# msg = Message(cc, channel=1)

# conn.write(msg)

import mido

outport = mido.open_output('IAC Driver Bus 1')
outport.send(mido.Message('note_on', note=60, velocity = 100))