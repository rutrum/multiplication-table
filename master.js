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
var algorithms = document.querySelector('#filter-algorithms')
algorithms.addEventListener('click', showSettings.bind(event, "alg"))
var animation = document.querySelector('#filter-animation')
animation.addEventListener('click', showSettings.bind(event, "animation"))

function showSettings(filter) {
    hideAllSettings();
    var generalSettings = document.querySelectorAll('.' + filter)
    for (let setting of generalSettings) {
        setting.style.display = "initial"
    }
}

function hideAllSettings() {
    var settings = document.querySelectorAll('.setting')
    for (let setting of settings) {
        setting.style.display = "none";
    }
}

// Create useful DOM variables
var table = document.querySelector("#table")
var br = document.createElement("br")
var template = document.querySelector(".template")
template.classList.remove("template")

let loop;

function onFormSubmit(event) {
    event.preventDefault()
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

function onSettingsSelection(event) {
    event.preventDefault()
    console.log(event.target.value)
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
    settings.underLattice = form.mod0.checked
    settings.firstFree = form.mod1.checked
    settings.secondFree = form.mod2.checked
    settings.thirdFree = form.mod6.checked
    settings.fourthFree = form.mod12.checked
    settings.fifthFree = form.mod60.checked

    // If crop lattice and its not a prime number, that is no lattice
    if (form.cropLattice.checked && settings.pairs.length > 0) {
        settings.width = settings.pairs[0][1]
        const length = settings.pairs.length
        settings.height = settings.pairs[length - 1][0]
    }

    settings.colored = [0, 0, 0, 0, 0, 0];
    initLi()

    // Reset table
    clearTable()
    if (settings.showTable) {
        fillTable()
    } else {
        justValues()
    }

    for (let i = 5; i > 0; i--) {
        settings.colored[i - 1] += settings.colored[i]; 
    }
    let algs = document.querySelectorAll(".count")
    let i = 0;
    for (let i = 0; i < 6; i++) {
        if (algs[i].previousElementSibling.checked) {
            algs[i].textContent = settings.colored[i]
        } else {
            algs[i].textContent = " "
        }
    }
    console.log(algs)
    console.log(settings.colored)
}

function clearTable() {
    table.innerHTML = ""
}

function initLi() {
    Gi = greatestIntegersInRow(60)

    settings.Li5 = []
    for (let i = 1; i <= 60; i++) {
        settings.Li5.push(0);
        for (let j = 1; j <= i; j++) {
            if (i % j == 0) {
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

                Gi = greatestIntegersInRow(60)
                // console.log(Gi)

                if (settings.fifthFree) {

                    if (p % 60 == 0 && p > settings.Li5[59]) {
                        settings.colored[5]++
                        return "fifth-free"
                    }

                    for (let i = 1; i < 60; i++) {
                        if (p % 60 == i && p > settings.Li5[i-1]) {
                            settings.colored[5]++
                            return "fifth-free"
                        }
                    }
                }

                if (settings.fourthFree) {
                    
                    if (p % 12 == 0 && p > settings.Li4[11]) {
                        settings.colored[4]++
                        return "fourth-free"
                    }

                    for (let i = 1; i < 12; i++) {
                        if (p % 12 == i && p > settings.Li4[i-1]) {
                            settings.colored[4]++
                            return "fourth-free"
                        }
                    }
                }

                if (settings.thirdFree) {

                    if (p % 6 == 0 && p > settings.Li3[5]) {
                        settings.colored[3]++
                        return "third-free"
                    }

                    for (let i = 1; i < 6; i++) {
                        if (p % 6 == i && p > settings.Li3[i-1]) {
                            settings.colored[3]++
                            return "third-free"
                        }
                    }
                }

                if (settings.secondFree) {

                    if (p % 2 == 0 && p > settings.Li2[1]) {
                        // Even row
                        settings.colored[2]++
                        return "second-free"
                    } else if (p % 2 == 1 && p > settings.Li2[0]) {
                        // Odd row
                        settings.colored[2]++
                        return "second-free"
                    }
                }

                if (settings.firstFree) {
                    // Does first row free see it?
                    if (pairs.length > 0 && p + 1 > pairs[0][1]) {
                        settings.colored[1]++
                        return "first-free"
                    }
                }
                if (settings.underLattice) {
                    settings.colored[0]++
                    return "under-lattice"
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
            do {
                i += step
            } while (isPrime(i))
        }
    }, period)
}