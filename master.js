settings = {
    width: 20,
    height: 10,
    size: 20,
    n: 28,
    showNumbers: true
}

// Add event listeners
var form = document.querySelector("#settings-form")
var submit = document.querySelector('#submit')
submit.addEventListener('click', onFormSubmit);
var general = document.querySelector('#filter-general')
general.addEventListener('click', showSettings.bind(event, "general"))
var algorithms = document.querySelector('#filter-algorithm')
algorithms.addEventListener('click', showSettings.bind(event, "algorithm"))
var animation = document.querySelector('#filter-animation')
animation.addEventListener('click', showSettings.bind(event, "animation"))

function showSettings(filter) {
    hideAllSettings();
    var theseSettings = document.querySelectorAll('.' + filter)
    for (let setting of theseSettings) {
        setting.style.display = "initial"
    }
    document.querySelector('#filter-' + filter).classList.add('selected')
}

function hideAllSettings() {
    var settings = document.querySelectorAll('.setting')
    for (let setting of settings) {
        setting.style.display = "none";
    }
    var filters = document.querySelectorAll('.selection')
    for (let filter of filters) {
        filter.classList.remove('selected')
    }
}

// Create useful DOM variables
var table = document.querySelector("#table")
var br = document.createElement("br")
var template = document.querySelector(".template")
template.classList.remove("template")

let loop;

function onFormSubmit(event) {
    // event.preventDefault()
    window.clearInterval(loop)

    if (form.animate.checked) {
        let lower = parseInt(form.startn.value)
        let upper = parseInt(form.endn.value)
        let step = parseInt(form.step.value)
        let period = parseInt(form.period.value)
        form.cropLattice.checked = false;
        loopThrough(lower, upper, step, period)
    } else {
        updateSettings()
    }
}

// Function for settings-form submission
function updateSettings() {

    // Update template based on values
    size = parseInt(form.size.value)
    template.style.lineHeight = size + "px"
    template.style.width = size
    template.style.height = size

    // font = parseInt(form.font.value)
    // template.style.fontSize = font
    template.style.fontSize = parseInt(size) / 2

    // Update global settings
    settings.width = parseInt(form.width.value)
    settings.height = parseInt(form.height.value)
    settings.n = parseInt(form.n.value)
    settings.pairs = getFactorPairs()
    settings.showNumbers = form.showNumbers.checked
    settings.showTable = form.showTable.checked
    settings.mod0 = form.mod0.checked
    settings.mod1 = form.mod1.checked
    settings.mod2 = form.mod2.checked
    settings.mod6 = form.mod6.checked
    settings.mod12 = form.mod12.checked
    settings.mod60 = form.mod60.checked
    settings.mod120 = form.mod120.checked

    // If crop lattice and its not a prime number, that is no lattice
    if (form.cropLattice.checked && settings.pairs.length > 0) {
        settings.width = settings.pairs[0][1]
        const length = settings.pairs.length
        settings.height = settings.pairs[length - 1][0]
    }

    settings.colored = [0, 0, 0, 0, 0, 0, 0];
    initLi()

    // Reset table
    clearTable()
    if (settings.showTable) {
        fillTable()
    } else {
        justValues()
    }

    for (let i = settings.colored.length - 1; i > 0; i--) {
        settings.colored[i - 1] += settings.colored[i]; 
    }
    let algs = document.querySelectorAll(".count")
    
    for (let i = 0; i < settings.colored.length; i++) {
        if (algs[i].nextElementSibling.checked) {
            algs[i].textContent = settings.colored[i]
        } else {
            algs[i].textContent = "_"
        }
    }
}

function clearTable() {
    table.innerHTML = ""
}

function initLi() {
    Gi = greatestIntegersInRow(120)

    settings.Li6 = []
    for (let i = 1; i <= 120; i++) {
        settings.Li6.push(0);
        for (let j = 1; j <= i; j++) {
            if (120 % j == 0 && i % j == 0) {
                settings.Li6[i-1] = Math.max(settings.Li6[i-1], Gi[j - 1])
            }
        }
    }

    settings.Li5 = []
    for (let i = 1; i <= 60; i++) {
        settings.Li5.push(0);
        for (let j = 1; j <= i; j++) {
            if (60 % j == 0 && i % j == 0) {
                settings.Li5[i-1] = Math.max(settings.Li5[i-1], Gi[j - 1])
            }
        }
    }

    settings.Li4 = [];
    for (let i = 1; i <= 12; i++) {
        settings.Li4.push(0);
        for (let j = 1; j <= i; j++) {
            if (12 % j == 0 && i % j == 0) {
                settings.Li4[i-1] = Math.max(settings.Li4[i-1], Gi[j - 1])
            }
        }
    }

    settings.Li3 = [];
    for (let i = 1; i <= 6; i++) {
        settings.Li3.push(0);
        for (let j = 1; j <= i; j++) {
            if (6 % j == 0 && i % j == 0) {
                settings.Li3[i-1] = Math.max(settings.Li3[i-1], Gi[j - 1])
            }
        }
    }

    settings.Li2 = [Gi[0], Math.max(Gi[0], Gi[1])]
    
}

function justValues() {
    for (let row = settings.height; row > 0; row--) {
        for (let col = 1; col <= settings.width; col++) {
            getColorClass(row, col)
        }
    }
}

function fillTable() {

    // For each row
    for (let row = settings.height; row > 0; row--) {

        // Write left border cell
        createBorder(row)

        // For each column
        for (let col = 1; col <= settings.width; col++) {
            createCell(row, col)
        }

        // Add newline
        table.appendChild(br.cloneNode())
    }

    // Write bottom left border cell
    createBorder()

    // Write bottom border cells
    for (let col = 1; col <= settings.width; col++) {
        createBorder(col)
    }

}

function createBorder(val = "_") {
    var cell = template.cloneNode()
    cell.textContent = val
    cell.classList.add("border")
    table.appendChild(cell)
}

function createCell(row = 0, col = 0) {
    var cell = template.cloneNode()
    if (settings.showNumbers) {
        cell.textContent = row * col
    }
    cell.classList.add(getColorClass(row, col))
    table.appendChild(cell)
}

function getColorClass(row, col) {

    // Is cell in lower half
    if (col >= row) {

        let p = row * col;
        
        // Is cell equal to n
        if (p == settings.n) {
            return "n"
        }

        // See if it lies under the grid
        let pairs = settings.pairs

        for (let i = 0; i < pairs.length; i++) {
            if ((row < pairs[i][0]) && (col < pairs[i][1])) {

                // Gi = greatestIntegersInRow(120)
                // console.log(Gi)

                if (p == 225) {
                    console.log("mod120 " + 224%120 + " " + settings.Li6[224 % 120])
                    console.log("mod60 " + 224%60 + " " + settings.Li5[224 % 60])
                }

                if (settings.mod120) {

                    if (p % 120 == 0 && p > settings.Li6[119]) {
                        settings.colored[6]++
                        return "mod120"
                    }

                    for (let i = 1; i < 120; i++) {
                        if (p % 120 == i && p > settings.Li6[i-1]) {
                            settings.colored[6]++
                            return "mod120"
                        }
                    }
                }

                if (settings.mod60) {

                    if (p % 60 == 0 && p > settings.Li5[59]) {
                        settings.colored[5]++
                        return "mod60"
                    }

                    for (let i = 1; i < 60; i++) {
                        if (p % 60 == i && p > settings.Li5[i-1]) {
                            settings.colored[5]++
                            return "mod60"
                        }
                    }
                }

                if (settings.mod12) {
                    
                    if (p % 12 == 0 && p > settings.Li4[11]) {
                        settings.colored[4]++
                        return "mod12"
                    }

                    for (let i = 1; i < 12; i++) {
                        if (p % 12 == i && p > settings.Li4[i-1]) {
                            settings.colored[4]++
                            return "mod12"
                        }
                    }
                }

                if (settings.mod6) {

                    if (p % 6 == 0 && p > settings.Li3[5]) {
                        settings.colored[3]++
                        return "mod6"
                    }

                    for (let i = 1; i < 6; i++) {
                        if (p % 6 == i && p > settings.Li3[i-1]) {
                            settings.colored[3]++
                            return "mod6"
                        }
                    }
                }

                if (settings.mod2) {

                    if (p % 2 == 0 && p > settings.Li2[1]) {
                        // Even row
                        settings.colored[2]++
                        return "mod2"
                    } else if (p % 2 == 1 && p > settings.Li2[0]) {
                        // Odd row
                        settings.colored[2]++
                        return "mod2"
                    }
                }

                if (settings.mod1) {
                    // Does first row free see it?
                    if (pairs.length > 0 && p + 1 > pairs[0][1]) {
                        settings.colored[1]++
                        return "mod1"
                    }
                }
                if (settings.mod0) {
                    settings.colored[0]++
                    return "mod0"
                }
                break;
            }
        }
    }

    // return default color
    if ((row + col) % 2) {
        return "even"
    } else {
        return "odd"
    }
}

function greatestIntegersInRow(numRows) {
    let list = [];
    pairs = settings.pairs

    for (let i = 0; i < pairs.length && list.length < numRows; i++) {
        if (pairs[i][0] > list.length + 1) {
            list.push((pairs[i][1] - 1) * (list.length + 1))
            i--;
        }
    }
    while (list.length < numRows) {
        list.push(0)
    }
    return list;
}

function getFactorPairs() {
    let pairs = []
    for (let i = 2; i * i <= settings.n; i++) {
        if (settings.n % i == 0) {
            pairs.push([i, settings.n / i])
        }
    }
    return pairs
}

function isPrime(n) {
    for (let i = 2; i * i < n; i++) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}

updateSettings()

function loopThrough(lower, upper, step, period) {
    let i = lower
    let noPrimes = form.skipPrimes.checked 
    loop = window.setInterval(() => {
        if (i < upper) {
            form.n.value = i
            updateSettings()
            if (!noPrimes) {
                do {
                    i += step
                } while (isPrime(i))
            } else {
                i += step
            }
        }
    }, period)
}