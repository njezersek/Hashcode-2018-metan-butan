/*
  HASHCODE 2018

  run:
  >node code_node.js <ime input datoteke brez koncnice>
*/

var inputFile = process.argv[2];

var fs = require('fs');

fs.readFile('inputs/'+inputFile+'.in', parse);

function parse(err, data){
  if (err) throw err;

  input = data.toString();
  let vrstice = [];
	let voznje = [];
	vrstice = input.split('\n');
	for(let i=1; i<vrstice.length; i++){
    if(vrstice[i].length > 0){
      let params = vrstice[i].split(" ").map(a => Number(a));
      voznje.push(new Voznja(...params, voznje.length));
    }
	}
  let params = vrstice[0].split(" ").map(a => Number(a));
  simulacija = new Simulacija(...params, 0, voznje);

  simulacija.run();
}

class Simulacija{
	constructor(R, C, F, N, B, T, CAS, voznje){
    this.R = R;
    this.C = C;
    this.F = F;
    this.N = N;
    this.B = B;
    this.T = T;
    this.CAS = CAS;
    this.voznje = voznje;
    this.avti = [];

    for(let i=0; i<this.F; i++){
      this.avti.push(new Avto());
    }
  }

  run(){
    for(let t=0; t<this.T-1; t++){
    	this.tick();
    }
    this.output();
  }

  tick(){
    for(let a=0; a<this.avti.length; a++){
  		let avto = this.avti[a];

  		// Če avto nima stranke jo poišči.
  		if(!avto.voznja) this.najdiVoznjo(avto);

  		if(avto.voznja){
  			avto.preostaliCasVoznje--;
  			if(avto.preostaliCasVoznje <= 0) {
  				avto.x = avto.voznja.x2;
  				avto.y = avto.voznja.y2;
  				avto.voznja = false;
  				this.najdiVoznjo(avto);
  			}
  		}
  	}

  	this.CAS++;
  }

  najdiVoznjo(avto){
    let maxTocke = 0;
  	let index = -1;
  	for(let v=0; v<this.voznje.length; v++){
  		let voznja = this.voznje[v];
  		voznja.tocke = avto.izracunajTocke(voznja, this);
  		if(voznja.tocke > maxTocke){
  			maxTocke = voznja.tocke;
  			index = v;
  		}
  	}

  	if(index == -1) return; // ni najdel nobene voznje

    // //preveri ce lahko vzames voznjo
    // if(avto.razdaljaDoPotnika(this.voznje[index]) > this.voznje[index].kc){
    //   return;
    // }

  	avto.nastaviVoznjo(this.voznje[index]);

  	// računanje dolžine vožnje
  	avto.izracunajCasVoznje(avto.voznja, this.CAS);

  	//console.table(this.voznje);

    //izbrisi voznjo iz seznama vozenj, ki jih mormo se opraviti
  	this.voznje.splice(index,1);
  }

  output(){
    let sestevekTock = 0;
  	let text = "";
  	for(let i=0; i<this.avti.length; i++){
  		text += this.avti[i].records.length;
  		for(let r=0; r<this.avti[i].records.length; r++){
  			text += ' ' + this.avti[i].records[r].id;
        sestevekTock += this.avti[i].records[r].tocke;
  		}
  		text += "\n";
  	}

    fs.writeFile('outputs/'+inputFile+'.txt', text, function (err) {
      if (err) throw err;
      console.log(text + '\n\nsharnjeno v outputs/'+inputFile+'.txt');
      console.log("Tocke:" + sestevekTock);
    });

  }
}

class Voznja{
  constructor(x1,y1,x2,y2,zc,kc, id){
		this.id = id;
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.zc = zc;
		this.kc = kc;
		this.d = Math.abs(y1-y2) + Math.abs(x1-x2);
		this.prevoz = false;
		this.tocke = 0;
	}
}

class Avto{
	constructor(){
		this.x = 0;
		this.y = 0;
		this.voznja = false;
		this.records = [];
		this.preostaliCasVoznje = 0;
	}
	razdaljaDoPotnika(voznja){
		return Math.abs(this.x - voznja.x1) + Math.abs(this.y - voznja.y1);
	}

  izracunajCasVoznje(voznja, CAS){
    let razdaljaDoPotnika = this.razdaljaDoPotnika(voznja);
  	let cakanjeNaPotnika = voznja.zc - CAS;
    let potDoPotnika = Math.max(razdaljaDoPotnika, cakanjeNaPotnika);
  	return this.preostaliCasVoznje = voznja.d + potDoPotnika;
  }

  nastaviVoznjo(voznja){
    if(this.voznja) return false;
    this.voznja = voznja;
    this.records.push(voznja);
  }

  izracunajTocke(voznja, simulacija){
    let tocke = voznja.d; // tocke so enake dolzini poti

    //ce poberes stranko ob zelenem času (ali prej) dobiš bonus
    if(simulacija.CAS + this.razdaljaDoPotnika(voznja) <= voznja.zc){
      tocke += simulacija.B;
    }

    //če na cilj prideč prepozno dobiš NIČ točk
    if(simulacija.CAS + this.izracunajCasVoznje(voznja, simulacija.CAS) > voznja.kc){
      tocke = 0;
    }

    return tocke;
  }
}
