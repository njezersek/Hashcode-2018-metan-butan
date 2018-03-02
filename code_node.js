var fs = require('fs');
fs.readFile('inputs/a_example.in', parse);

function parse(err, data){
    input = data.toString();
    let temp = [];
	let array = [[]];
	temp = input.split('\n');
	for(let i=1, j=0; i<temp.length; i++){
		let line = temp[i];
		if(line != ""){
			array[j] = line.split('');
			j++;
		}
	}
	pizza = array;

    console.log(pizza);
}
