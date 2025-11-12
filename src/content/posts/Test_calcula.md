---
title: "Test Calculadora"
published: 2025-11-12
draft: false
description: 'Test Calculadora en Javascript'
tags: ['python']
---

Test de una calculadora en Javascript
<fieldset>
    <h1>Electric Power Conversion</h1>
        <div class="form-group required">  
            <label class="form-control-label" for="Voltage">Voltaje:</label>
            <input class="form-control" type="number" name="voltaje" id="voltaje" value="380" required="">
        </div>
        <div class="form-group required">  
            <label class="form-control-label" for="powerFactor">Power Factor:</label>
            <input class="form-control" type="float" name="pf" id="pf" value="0.85" required="">
        </div>
        <div class="form-group required">  
            <label class="form-control-label" for="power">Power:</label>
            <input class="form-control" type="float" name="pw" id="pw" value="0" required="">
        </div>
        <button id="btn_calc" type="submit">Calcular</button>
        <label id="resultado">Resultado</label>
</fieldset>

<script>

  // Find our component DOM on the page.
  const button = document.getElementById("btn_calc");
  const voltage = document.getElementById('voltaje')
  const pf = document.getElementById('pf')
  const pw = document.getElementById('pw')
  const res = document.getElementById('resultado')
  // Add event listeners to calc power when a button is clicked.
 // buttons.forEach((button) => {
    button.addEventListener('click', () => calcPower());
 // });
 
function calcPower()
{
    let volt = voltage.valueAsNumber
    let pf2= parseFloat(pf.value)
    let pw2 = parseFloat(pw.value)
    let resu= (pw2*1000) / (Math.sqrt(3) * pf2 * volt )
    res.innerHTML=`Resultado:  ${resu.toFixed(2)} A`
}
 
</script>
