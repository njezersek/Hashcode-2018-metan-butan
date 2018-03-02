let R = 0;
let C = 0;
let F = 0;
let N = 0;
let B = 0;
let T = 0;
let CAS = 0;

function ZacetniParametri(r,c,f,n,b,t){
	R = r;
	C = c;
	F = f;
	N = n;
	B = b;
	T = t;
}

ZacetniParametri(4039,1660,3262,739,18491,44622);

let id = 0;
class Voznja { // x = stolpec, y = vrstica
	constructor(x1,y1,x2,y2,zc,kc){
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
		id++;
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
}

function InputTekstVArray(input){
	let temp = [];
	let array = [[]];
	temp = input.split('\n');
	for(let i=0, j=0; i<temp.length; i++){
		let line = temp[i];
		if(line != ""){
			array[j] = line.split(' ');
			for(let k=0; k<array[j].length; k++) array[j][k] = array[j][k] * 1;
			j++;
		}
	}
	return array;
}

let voznjeInput = InputTekstVArray(document.getElementById('text').innerHTML);

let voznje = [];
for(let i=0; i<voznjeInput.length; i++){
	let v = voznjeInput[i];
	voznje.push(new Voznja( v[0], v[1], v[2], v[3], v[4], v[5] ));
}

let aI = 0;

let avti = [];
for(let i=0; i<F; i++){
	avti.push(new Avto());
}

function Tick(){
	let avto = avti[aI];

	// Če avto nima stranke jo poišči.
	if(!avto.voznja) NajdiVoznjo(avto);

	if(avto.voznja){
		avto.x = avto.voznja.x2;
		avto.y = avto.voznja.y2;
		CAS += avto.preostaliCasVoznje;
		avto.voznja = false;
		NajdiVoznjo(avto);
	} else{
		return "break";
	}
}

function NajdiVoznjo(avto){
	let maxTocke = 0;
	let index = -1;
	for(let v=0; v<voznje.length; v++){
		let voznja = voznje[v];
		voznja.tocke = IzracunajTocke(voznja, avto, CAS);
		if(voznja.tocke > maxTocke){
			maxTocke = voznja.tocke;
			index = v;
		}
	}

	if(index == -1) return;

	avto.voznja = voznje[index];

	// računanje dolžine vožnje
	let avtoDoPotnika = avto.razdaljaDoPotnika(avto.voznja);
	let cakanje = -avto.voznja.zc + CAS + avtoDoPotnika;
	if(cakanje > 0) cakanje = 0;
	avto.preostaliCasVoznje = avto.voznja.d + avtoDoPotnika - cakanje;
	// 
	avto.records.push(voznje[index]);
	console.table(voznje);
	voznje.splice(index,1);
}



function IzracunajTocke(voznja, avto, CAS){
	if(voznja.kc - CAS - voznja.d >= 0){
		let avtoDoPotnika = avto.razdaljaDoPotnika(voznja);
		let pravicas = -voznja.zc + CAS + avtoDoPotnika;
		let vzamem = voznja.d;
		
		if(pravicas <= 0){
			vzamem += B;
		}

		if(vzamem > 0) return vzamem;
		return 0;
	}
}

while(aI < avti.length){
	while(CAS < T){
		if(Tick() == "break") break;
	}
	CAS = 0;
	aI++;
}


function Output(){
	let text = "";
	for(let i=0; i<avti.length; i++){
		text += avti[i].records.length;
		for(let r=0; r<avti[i].records.length; r++){
			text += ' ' + avti[i].records[r].id;
		}
		text += "\n";
	}
	document.getElementById('text').innerHTML = text;
}

Output();