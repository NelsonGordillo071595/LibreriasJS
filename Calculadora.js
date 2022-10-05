let MENSUAL = "mensual";
let ANUAL = "anual";
let totales = [];

function getTasa(tasa, tasa_tipo, periodo) {
    tasa_tipo == ANUAL ? (tasa = tasa / 12 ) : (tasa = tasa / 100.0)
    periodo == MENSUAL ? true : false;
    periodo == ANUAL && (tasa = tasa * 12);
    return tasa;
}

function getValorDeCuotaFija(monto, tasa, cuotas, periodo, tasa_tipo) {
    tasa = getTasa(tasa, tasa_tipo, periodo);
    valor = monto *( (tasa * Math.pow(1 + tasa, cuotas)) / (Math.pow(1 + tasa, cuotas) - 1) );
    return valor.toFixed(2);
}

function getAmortizacion(monto, tasa, cuotas, periodo, tasa_tipo) {
    let valor_de_cuota = getValorDeCuotaFija(monto, tasa, cuotas, periodo, tasa_tipo);
    let saldo_al_capital = monto;
    let items = new Array();

    for (i=0; i < cuotas; i++) {
        interes = saldo_al_capital * getTasa(tasa, tasa_tipo, periodo);
        abono_al_capital = valor_de_cuota - interes;
        saldo_al_capital -= abono_al_capital;
        numero = i + 1;
        
        interes = interes.toFixed(2);
        abono_al_capital = abono_al_capital.toFixed(2);
        saldo_al_capital = saldo_al_capital.toFixed(2);

        item = [numero, interes, abono_al_capital, valor_de_cuota, saldo_al_capital];
        items.push(item);
    }
    return items;
}

function setMoneda(num) {
    num = num.toString().replace(/\$|\,/g, '');
    isNaN(num) == true && (num = "0");
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100;
    num = Math.floor(num / 100).toString();
    cents < 10 && (cents = "0" + cents);
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
        num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
    return (((sign) ? '' : '-') + '$' + num + ((cents == "00") ? '' : '.' + cents));
}

function calcular() {
    let monto = 0;
    let cuotas = 0;
    let tasa = 0;
    monto = document.getElementById("input_monto").value;
    cuotas = document.getElementById("input_cuotas").value;
    tasa = document.getElementById("input_tasa").value;
    if (!monto) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Indique el monto',
          })
        return;
    }
    if (!cuotas) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Indique las cuotas',
          })
        return;
    }
    if (!tasa) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Indique la tasa de interés',
          })
        return;
    }
    if (parseInt(cuotas) < 1) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Las cuotas deben ser de 1 en adelante',
          })
        return;
    }
    let select_periodo = document.getElementById("select_periodo");
    periodo = select_periodo.options[select_periodo.selectedIndex].value;
    let select_tasa_tipo = document.getElementById("select_tasa_tipo");
    tasa_tipo = select_tasa_tipo.options[select_tasa_tipo.selectedIndex].value;
    let items = getAmortizacion(monto, tasa, cuotas, periodo, tasa_tipo);
    let tbody = document.getElementById("tbody_1");
    tbody.innerHTML = "";

    if (parseInt(cuotas) > 3000) { 
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Ha indicado una cantidad excesiva de cuotas, porfavor reduzcala a menos de 3000',
          }); 
        return; 
    }

    for (i = 0; i < items.length; i++) {
        item = items[i];
        tr = document.createElement("tr");
        for (e = 0; e < item.length; e++) {
            value = item[e];
            e > 0 && (value = setMoneda(value));
            td = document.createElement("td");
            textCell = document.createTextNode(value);
            td.appendChild(textCell);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }

    let div1 = document.getElementById("div-valor-cuota");

    valor = setMoneda(items[0][3]);
    div1.innerHTML = valor;
    let msg = "";

    class Consulta {
        constructor(monto, cuotas, tasa, tasa_tipo, periodo, valor){
            this.monto = monto
            this.cuotas= cuotas
            this.tasa = tasa 
            this.tasa_tipo = tasa_tipo
            this.periodo = periodo
            this.valor = valor
        }
    }

    let dataTemporal = new Consulta(monto, cuotas, tasa, tasa_tipo, periodo, valor)

    totales.push(dataTemporal);

    localStorage.setItem('consulta',JSON.stringify(dataTemporal));

    console.log(totales);

    periodo == "mensual" && (msg = "Usted pagará " + valor + ", mensualmente durante " + items.length + " meses.");
    periodo == "anual" && (msg = "Usted pagará " + valor + ", anualmente por un periodo de " + items.length + " años");

    let div2 = document.getElementById("div-comentario");
    div2.innerHTML = msg;

    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Ok',
        showConfirmButton: false,
        timer: 1500
      })
}

function borrar() {

    Swal.fire({
        title: 'Desea borrar la consulta?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Borrado',
            'Su consulta ha sido borrada',
            'success'
          )
        }
      })

          
    document.getElementById("input_monto").value = 0;
    document.getElementById("input_cuotas").value = 0;
    document.getElementById("input_tasa").value = 0;
    let div2 = document.getElementById("div-comentario");
    div2.innerHTML = " ";
    let div1 = document.getElementById("div-valor-cuota");
    div1.innerHTML = "";
    let tbody = document.getElementById("tbody_1");
    tbody.innerHTML = "";

}