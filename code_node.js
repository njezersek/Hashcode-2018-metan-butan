/*
  HASHCODE 2018

  run:
  >node code_node.js <ime input datoteke brez koncnice>

  v Avto.ovrednotiVoznjo() nastavi pravi način vrednotenja poti
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
    console.log("ZACETEK SIMULACIJE: " + inputFile);
    for(let t=0; t<this.T-1; t++){
    	this.tick();
      if(t%Math.round((this.T-1)/100) == 0)console.log(((t/(this.T-1))*100).toFixed(0) + "%");
    }
    this.output();
  }

  tick(){
    for(let a=0; a<this.avti.length; a++){
  		let avto = this.avti[a];

  		// Če avto nima stranke jo poišči.
  		if(!avto.voznja) avto.najdiVoznjo(this);

      //če avto ima stranko, ga premakni naprej
  		if(avto.voznja){
  			avto.preostaliCasVoznje--;
        //ko pride na cilj
  			if(avto.preostaliCasVoznje <= 0) {
  				avto.x = avto.voznja.x2;
  				avto.y = avto.voznja.y2;
  				avto.voznja = false;
  				avto.najdiVoznjo(this);
  			}
  		}
  	}

  	this.CAS++;
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
      let tocke = sestevekTock.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      console.log("Tocke:" + tocke);
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

  izracunajCasDoPotnika(voznja, CAS){
    let razdaljaDoPotnika = this.razdaljaDoPotnika(voznja);
    let cakanjeNaPotnika = voznja.zc - CAS;
    let potDoPotnika = Math.max(razdaljaDoPotnika, cakanjeNaPotnika);
    return potDoPotnika;
  }

  izracunajCasVoznje(voznja, CAS){
    let potDoPotnika = this.izracunajCasDoPotnika(voznja, CAS);
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
    let casVoznje = this.izracunajCasVoznje(voznja, simulacija.CAS);
    if(simulacija.CAS + casVoznje > voznja.kc){
      tocke = 0;
    }

    return tocke;
  }

  ovrednotiVoznjo(voznja, simulacija){
    let tocke = this.izracunajTocke(voznja, simulacija);
    let razdaljaDoPotnika = this.razdaljaDoPotnika(voznja);
    let casDoPotnika = this.izracunajCasDoPotnika(voznja, simulacija.CAS);
    let dolzinaPoti = voznja.d;
    let cakanjeNaPotnika = voznja.zc - simulacija.CAS;

    //metropolis - 11,782,737
    //high_bonus - 21,457,613
    if(casDoPotnika+razdaljaDoPotnika < voznja.kc){
      return  tocke/(dolzinaPoti*casDoPotnika);
    }
    else{
      return 0;
    }


    // should_be_easy - 176,820
    //no_hurry - 15,790,930
    //metropolis - 9,866,810
    return tocke/casDoPotnika;
  }

  najdiVoznjo(simulacija){
    let maxTocke = 0;
  	let index = -1;
  	for(let v=0; v<simulacija.voznje.length; v++){
  		let voznja = simulacija.voznje[v];
  		voznja.tocke = this.ovrednotiVoznjo(voznja, simulacija);
  		if(voznja.tocke > maxTocke){
  			maxTocke = voznja.tocke;
  			index = v;
  		}
  	}

  	if(index == -1) return; // ni najdel nobene voznje

    let izbranaVoznja = simulacija.voznje[index];

    izbranaVoznja.tocke = this.izracunajTocke(izbranaVoznja, simulacija);

  	this.nastaviVoznjo(izbranaVoznja);

  	// računanje dolžine vožnje
  	this.izracunajCasVoznje(this.voznja, simulacija.CAS);

    //izbrisi voznjo iz seznama vozenj, ki jih mormo se opraviti
  	simulacija.voznje.splice(index,1);
  }
}
