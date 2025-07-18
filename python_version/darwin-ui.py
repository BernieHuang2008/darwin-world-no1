# Darwin World No.1
from datetime import datetime
from random import choice as random_choice
from random import random, randint, seed
import math
import webview
import sys

s = int(datetime.now().timestamp())
seed(s)

sys.stdout = open('record.txt', 'w')
print("Start Darwin-World No.1")
print("Darwin-World No.1 is a simulation of the evolution of life.")
print("It's a world that only has 10x10 cells, and 20 lives.")
print("Seed: {}".format(s))
print("=" * 20, "\n" * 3)


def print_to_record(*args):
    global records
    records += ' '.join(map(str, args)) + '\n'


_print = print
print = print_to_record

"""
map:
  - 1: Land
  - 2: Sea

A map generated by the RAND() function of EXCEL are below:
"""
ID = 0

map_lst = [[0.5, 0.0, 0.3, 0.3, 0.1, 0.9, 0.3, 0.9, 0.3, 0.4],
           [0.0, 0.4, 0.5, 0.1, 0.6, 0.3, 0.4, 0.1, 0.4, 0.4],
           [0.2, 0.3, 0.3, 0.4, 0.4, 0.5, 0.3, 0.2, 0.0, 0.0],
           [0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.0, 0.1, 0.1, 0.1],
           [-0.3, -0.3, -0.2, -0.2, -0.1, -0.2, -0.1, 0.0, -0.2, -0.2],
           [-0.1, -0.3, -0.2, -0.3, -0.4, -0.4, -0.1, 0.0, -0.1, -0.2],
           [-0.1, -0.6, -0.3, -0.7, -0.5, 0.0, -0.3, -0.3, -0.5, -0.4],
           [-1.0, -0.2, -0.6, -0.3, -0.5, -0.8, -0.3, -0.6, -0.2, -0.5],
           [-0.6, -0.9, -0.7, -0.7, -0.9, 0.0, -0.6, -0.2, -0.5, -0.2],
           [-0.5, -0.3, -0.9, -0.9, -0.8, -0.9, -0.1, -0.9, -0.5, -0.2]]

land = [[[] for _ in range(10)] for _ in range(10)]

html_code = """
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Darwin-World</title>
    <style>
      .orange {
        color: #ff7e30;
      }

      .blue {
        color: #50aabc;
      }

      .purple {
        color: #8b67cc;
      }
      
      .pink {
        color: #bf8e97;
      }

      .life {
        --window-PLAYSPEED: 0.2s;
      
        width: 20px;
        height: 20px;
        margin: 5px;
        background-color: black;
        border-radius: 100px;
        color: #ff6a56;
        text-align: center;
        position: absolute;
        
        transition: all var(--window-PLAYSPEED);
      }

      #profilebox {
        background-color: black;
        color: #c4ad72;
        max-width: 320px;
        margin-top: 10px;
        padding: 10px;
        position: fixed;
        display: none;
      }
      
      .progress-bar{
        height: 3px;
        width: 90%;
        border: solid 0.5px;
      }
      
      .progress-bar.vertical{
        height: 1em;
        width: 0.5em;
        display: inline-block;
        margin-left: 0.5em;
      }
    </style>
  </head>
  <body>
    <input type="file" id='file' onchange="upfile(this)">
    <div id='showbox'>
      <table id='st'></table>
    </div>
    <div id='infobox'
      style='position: absolute;height: calc(100vh - 40px);overflow: auto;right: 0;top: 0;padding: 20px;max-width: calc(100vw - 400px)'>
    </div>
    <div id='coverbox'>
    </div>
    <button onclick="next(-1)">Prev Step</button>
    <button onclick="next()">Next Step</button>
    <button id='apbutton'>Auto Play</button>
    Step: <div id='stepnum' style="display: inline;">0</div>
    <div id='profilebox'></div>
  </body>
  <script>
    window.res = ['none']
    window.step_num = 0
  
    function multi_str(s, n) {
      var ss = '';
      for (var i = 0; i < n; i++)
        ss += s;
      return ss;
    }
    st.innerHTML = multi_str('<tr>' + multi_str('<td></td>', 10) + '</td>', 10);

    map_lst = [
      [0.5, 0.0, 0.3, 0.3, 0.1, 0.9, 0.3, 0.9, 0.3, 0.4],
      [0.0, 0.4, 0.5, 0.1, 0.6, 0.3, 0.4, 0.1, 0.4, 0.4],
      [0.2, 0.3, 0.3, 0.4, 0.4, 0.5, 0.3, 0.2, 0.0, 0.0],
      [0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.0, 0.1, 0.1, 0.1],
      [-0.3, -0.3, -0.2, -0.2, -0.1, -0.2, -0.1, 0.0, -0.2, -0.2],
      [-0.1, -0.3, -0.2, -0.3, -0.4, -0.4, -0.1, 0.0, -0.1, -0.2],
      [-0.1, -0.6, -0.3, -0.7, -0.5, 0.0, -0.3, -0.3, -0.5, -0.4],
      [-1.0, -0.2, -0.6, -0.3, -0.5, -0.8, -0.3, -0.6, -0.2, -0.5],
      [-0.6, -0.9, -0.7, -0.7, -0.9, 0.0, -0.6, -0.2, -0.5, -0.2],
      [-0.5, -0.3, -0.9, -0.9, -0.8, -0.9, -0.1, -0.9, -0.5, -0.2]
    ]

    for (var y = 0; y < 10; y++) {
      for (var x = 0; x < 10; x++) {
        st.children[0].children[y].children[x].style.backgroundColor = (map_lst[y][x] < 0 ? 'rgba(35, 170, 242, ' :
          'rgba(51, 196, 129, ') + Math.abs(map_lst[y][x]) + ")"
        st.children[0].children[y].children[x].style.width = '30px';
        st.children[0].children[y].children[x].style.height = '30px';
      }
    }

    step_num = 0;
    condition_cards = {};
    position = {};
    
    
    function upfile(t) {
      console.log(t);
      var fr = new FileReader();
      fr.readAsText(t.files[0]);
      fr.onloadend = function() {
        res = fr.result.trim().replaceAll('\\r', '\\n');
        res = res.replaceAll('@ ', ' ');
        res = res.replaceAll(/\\n+/g, '\\n');
        res = res.replaceAll(/\\x20+/g, ' ');
        res = res.replaceAll(/\&\&\&\&\&\&\&\&\&\& Round [0-9]{1,3} End \&\&\&\&\&\&\&\&\&\&/g, '');
        window.res = res.split(/\&\&\&\&\&\&\&\&\&\& Round [0-9]{1,3} Start \&\&\&\&\&\&\&\&\&\&/g);
        next();
      }
    }

    function next(n) {
      if(!res[step_num+1] && !(n<0))
        return pywebview.api.new_round();
      step_num += n || 1;
      stepnum.innerText = step_num;
      if (n<0) {
        map_clear();
      }

      condition_cards = {};
      position = {};
      var in_condition_card = false;
      movement = '';
      names = []

      step_script = res[step_num].split('\\n');
      step_script.forEach(s => {
        name = in_condition_card;
        switch (s[1]) {
          case 'M':
            movement += s + '\\n';
            break;
          case 'O':
            movement += s + '\\n';
            break;
          case '-':
            condition_cards[name] += s + '\\n';
            break;
          case '·':
            condition_cards[name] += s + '\\n';
            if (s[3] == 'P') {
              position[name] = s.replace(/ · Position: \(([0-9]), ([0-9])\)/, '$1$2').split('');
              goto_pos(name, position[name]);
            }
            break;
          case '*':
            condition_cards[in_condition_card] += s + '\\n';
            break;
          case '=':
            in_condition_card = !in_condition_card;
            if (in_condition_card) {
              name = s.match(/#[0-9]{1,4}/g)[0];
              condition_cards[name] = '';
              in_condition_card = name;
              names.push(name);
            }
            break;
          default:
            movement += s + '\\n';
        }
      })
      
      post_do(names);
      
      infobox.innerText = movement
      highlight(infobox);
    }
    
    function post_do(names) {
      names.forEach(name => {
        profile = condition_cards[name];
        hi = Math.max(0, Number((profile.match(/Health_Index:\s([0-9]\.{0,1}[0-9].+?)/g)||['1'])[0].replace(/Health_Index:\s([0-9]\.{0,1}[0-9].+?)/g, '$1')));
        document.getElementById('life_'+name.trim().replace('#', '')).style.backgroundColor = `rgba(0,0,0,${hi})`
      })
      
      for (var i=0; i<1000; i++) {
        var name = '#'+i;
        var obj = document.getElementById('life_'+name.trim().replace('#', ''));
        if(names.indexOf(name)==-1 && obj) {
          obj.style.display="none";
        }
      }
    }

    function map_clear() {
      coverbox.innerHTML = '';
    }

    function goto_pos(name, pos) {
      pos = [Number(pos[0]), Number(pos[1])];
      obj = document.getElementById('life_'+name.trim().replace('#', ''));
      if (obj){
        obj.style.left = `${10+34.1*pos[0]}px`; // body-margin & cells
        obj.style.top = `${31.1+34*pos[1]}px`; // body-margin & cells
        return;
      }
      obj = document.createElement('div');
      obj.classList = 'life';
      obj.innerText = name;
      obj.style.left = `${10+34.1*pos[0]}px`; // body-margin & cells
      obj.style.top = `${31.1+34*pos[1]}px`; // body-margin & cells
      obj.id = 'life_'+name.trim().replace('#', '');
      obj.onmouseover = function() {
        profilebox.style.display = 'block';
        change_profile(this.innerText);
      }
      obj.onmouseleave = function(){
        profilebox.style.display = 'none';
      }
      coverbox.appendChild(obj);
    }

    function change_profile(name) {
      profile = condition_cards[name];
      profilebox.innerText = name + "\\n" + profile;
      highlight(profilebox);
      
      oxygen = Math.max(0, Number((profile.match(/Oxygen:\s([0-9]\.{0,1}[0-9].+?)/g)||['1'])[0].replace(/Oxygen:\s([0-9]\.{0,1}[0-9].+?)/g, '$1')));
      health_idx = Math.max(0, Number((profile.match(/Health_Index:\s([0-9]\.{0,1}[0-9].+?)/g)||['1'])[0].replace(/Health_Index:\s([0-9]\.{0,1}[0-9].+?)/g, '$1')));
      height = Number(profile.match(/Height:\s([\-]{0,1}[0-9][\.]{0,1}[0-9]{0,1})/g)[0].replace(/Height:\s([\-]{0,1}[0-9][\.]{0,1}[0-9]{0,1})/g, '$1'));
      gender = profile.match(/Gender:\s(True|False)/g)[0].replace('Gender: ', '')
      
      profilebox.innerHTML = profilebox.innerHTML.replace(/Oxygen: <span class="purple">([0-9][\.]{0,1}[0-9]{0,100})<\/span><br>/g, 
      'Oxygen: <span class="purple">$1<\/span>'+`<div class='progress-bar' style='border-color: #277add;background: linear-gradient(90deg, #277add ${oxygen*100}%, black ${1}%);'></div>`)
      profilebox.innerHTML = profilebox.innerHTML.replace(/Health_Index: <span class="purple">([0-9][\.]{0,1}[0-9]{0,100})<\/span><br>/g, 
      'Health_Index: <span class="purple">$1<\/span>'+`<div class='progress-bar' style='border-color: red;background: linear-gradient(90deg, red ${health_idx*100}%, black ${1}%);'></div>`)
      profilebox.innerHTML = profilebox.innerHTML.replace(/Height: <span class="purple">([\-]{0,1}[0-9][\.]{0,1}[0-9]{0,1})<\/span>/g, 
      'Height: <span class="purple">$1<\/span>'+`<div class='progress-bar vertical' style='border-color: ${height<0?'skyblue':'green'};background: linear-gradient(${height<0?'180deg':'0deg'}, ${height<0?'skyblue':'green'} ${height*(height<0?-100:100)}%, black ${1}%);'></div>`)
      profilebox.innerHTML = profilebox.innerHTML.replace(/Gender: (True|False)/g, 
      `Gender: <b>${gender == 'True'?'<span class="blue">Male ♂</span>':'<span class="pink">Female ♀</span>'}</b>`)
    }

    function highlight(ele) {
      html = ele.innerHTML;

      html = html.replaceAll('<br>', '<br><br>');
      html = html.replaceAll(/(#[0-9]{1,3})/g, '<span class="orange">$1</span>')
      html = html.replaceAll(/(Pos\([0-9], [0-9]\))/g, '<span class="blue">$1</span>')
      html = html.replaceAll(/(\([0-9], [0-9]\))/g, '<span class="blue">$1</span>')
      html = html.replaceAll(/(\-{0,1}[0-9]\.{0,1}[0-9]{0,100})(\s|\]|,|\)|<br>)/g, '<span class="purple">$1</span>$2')

      ele.innerHTML = html;
    }

    document.addEventListener('mousemove', function(e) {
      profilebox.style.left = e.clientX + 'px';
      profilebox.style.top = e.clientY + 'px';
    })
    
    function auto_play(time) {
      next();
      setTimeout('auto_play(' + time + ')', time);
    }

    auto_playing = false;
    apbutton.onclick = function() {
      if (auto_playing) { // pause
        window.ap = auto_play;
        auto_play = null;
        setTimeout('auto_play=ap', window.PLAYSPEED*1000);
      } else {
        auto_play(window.PLAYSPEED*1000);
      }
      auto_playing = !auto_playing;
    }
    
    window.PLAYSPEED = 0.2;
  </script>
</html>
"""


# print(map_lst)


def get_oxygen(height):
    if height >= 0:  # on the land
        return 1 - height
    else:  # under the water
        return -1 - height


def get_height(pos):
    return map_lst[pos[1]][pos[0]]


class DNA:
    def __init__(self, dna: list):
        """
        DNA:
          - DNA[0]: Swimming ability
          - DNA[1]: Moving ability (on land)
          - DNA[2]: Shell ability
          - DNA[3]: Oxygen ability (if negative, then it's underwater-oxygen ability)
          - DNA[4]: Gender (False=Female / True=Male)
        """
        self.dna = dna
        self.oxygen_requirement = (sum(dna[:3]) / 3) * 0.5 + abs(dna[3]) * 0.05

    @classmethod
    def random(cls):
        return cls([random(), random(), random(), random() * 2 - 1, random() < 0.5])

    def __str__(self):
        return str(self.dna)

    def __getitem__(self, item):
        return self.dna[item]

    def __len__(self):
        return len(self.dna)

    @classmethod
    def breed(self, mum: list, dad: list):
        baby_dna = []

        # Heredity
        for i in range(len(mum)):
            baby_dna.append((mum[i] + dad[i]) / 2)

        # Variation
        v_index = randint(0, len(baby_dna) - 1)
        v_delta = random() * 0.1 * (1 if random() < 0.5 else -1)
        baby_dna[v_index] += v_delta
        if v_index == 3:
            limited = (-1, 1)
        else:
            limited = (0, 1)
        baby_dna[v_index] = max(limited[0], min(limited[1], baby_dna[v_index]))

        # random DNAs
        baby_dna[4] = random() < 0.5  # random Gender

        return baby_dna, (v_index, v_delta)


class Life:
    def __init__(self, dna: DNA):
        global ID, land
        ID += 1
        self.dna = dna
        self.oxygen = 1
        self.id = ID
        self.pos = (math.floor(random() * 10), math.floor(random() * 10))
        land[self.pos[1]][self.pos[0]].append(self)

    def action_breathe(self, height):
        # use oxygen
        oxy2 = self.dna.oxygen_requirement
        self.oxygen -= oxy2

        # breathe oxygen
        oxy1 = self.dna[3] * get_oxygen(height)
        self.oxygen = min(1, self.oxygen + oxy1)

        print('  O #{} Breathe {} Oxygen, and Use {} Oxygen, {} in total.'.format(self.id, oxy1, oxy2, oxy1 - oxy2))

        # check if dead
        if self.oxygen <= 0:
            self.action_dead('No Oxygen')

    def action_move(self):
        curr_moving_ability = (self.dna[0] if get_height(self.pos) < 0 else self.dna[1])
        move_or_not = (random() <= curr_moving_ability)
        if move_or_not is True:
            land[self.pos[1]][self.pos[0]].remove(self)
            x = self.pos[0] + randint(-1, 1)
            y = self.pos[1] + randint(-1, 1)
            self.pos = (min(9, max(0, x)), min(9, max(0, y)))  # 0 <= x,y <= 9
            self.oxygen -= 0.05
            print('  M #{} Moved to Pos{}, used 0.05 Oxygen.'.format(self.id, self.pos))
            land[self.pos[1]][self.pos[0]].append(self)
        else:
            print('  M #{} Didn\'t move at all.'.format(self.id))

    def action_dead(self, reason='Unknown Reason'):
        print("@ D #{} Dead because of '{}' at Pos{}.".format(self.id, reason, self.pos))
        land[self.pos[1]][self.pos[0]].remove(self)
        lives.remove(self)

    def move(self):
        self.action_move()
        self.action_breathe(get_height(self.pos))

    def conditions(self):
        print("========== Self Condition of #{} ==========".format(self.id))
        print(' - DNA:', self.dna)
        print(' - Gender:', self.dna[4])
        print(' - Oxygen Requirement:', self.dna.oxygen_requirement)
        print(' · Position:', self.pos)
        print(' · Height:', get_height(self.pos))
        print(' * Oxygen:', self.oxygen)
        print(' * Health_Index:', self.health_index())
        print("========== Self Condition ended ==========")

    def mate(self):
        if self.dna[4]:  # if gender is Male
            if len(land[self.pos[1]][self.pos[0]]) >= 2:  # if there are other animals in the land
                if random() < 0.3:  # don't want to mate.
                    return

                girlfriends = []
                for x in land[self.pos[1]][self.pos[0]]:
                    if x.dna[4] is False:
                        girlfriends.append(x)
                wife = random_choice(girlfriends)

                wife.breed(self.dna, self.id)
                self.oxygen -= 0.1

    def breed(self, dad: list, dad_id):
        baby_dna, variation = DNA.breed(self.dna.dna, dad)

        # generate new life
        lives.append(Life(DNA(baby_dna)))
        print(
            '  X #{} and #{} have mated. They\'ve got a baby #{}. #{} variate at DNA[{}] for {}'.format(
                self.id, dad_id, lives[-1].id, lives[-1].id, variation[0], variation[1]
            )
        )

        self.oxygen -= 0.1

    def health_index(self):
        return self.oxygen


lives = []
for _ in range(20):
    lives.append(Life(DNA.random()))

roundID = 1
pending_rounds = 0


class JsApi:
    def __init__(self):
        pass

    def new_round(self, *args):
        global records, roundID, lives
        records = ''
        print('\n' * 3)
        _print('&&&&&&&&&& Round {} Start &&&&&&&&&&'.format(roundID))
        for l in lives.copy():
            l.move()
            l.conditions()
            l.mate()
            print()
        print('{} Lives Remaining.'.format(len(lives)))
        window.evaluate_js('window.res.push(`' + records + '`);next()')
        _print(records)
        _print('&&&&&&&&&& Round {} End &&&&&&&&&&'.format(roundID))
        roundID += 1
        print()
        print()
        window.evaluate_js('console.log(' + str(len(lives)) + ')')
        if len(lives) >= 30:
            _print("!" * 10, "Error", "!" * 10)
            _print("Too many lives that over loaded the bio-sphere.")
            _print("Darwin-World Closed.")
            _print("!" * 27)
            window.evaluate_js(
                'alert("Error!\\nToo many lives that over loaded the bio-sphere.\\nDarwin-World Closed.")')
            window.destroy()
            exit(-1)

    def eveluate_py(self, pycode):
        return str(eval(pycode))


window = webview.create_window('Darwin-World No.1', html=html_code, js_api=JsApi(), x=0, y=0, width=3000, height=2000)
webview.start(window, debug=False)

records = ''
