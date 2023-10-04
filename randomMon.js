window.onload = function(){
    let btn = document.getElementById('enterInput')
    btn.addEventListener('click', startGenerate)

    /* uncomment after "get options from repository" implemented
    getMonsterFlags()
    getColors()
    */
}

function startGenerate(){
    var numMon = document.getElementById('numInput').value
    generate(numMon)
}

var units = 0
var desc= {
    'sizeDesc': '',
    'bodyDesc': '',
}
var mons = []
/* MONSTER TEMPLATE
    {
    "type": "MONSTER",
    "id": "mon_[NAME]',
    "name": { 
        "str": "[NAME]"
        "str_pl": "[NAME]s"  <-- for plurals
        "str_sp": '[NAME]' <-- if singular and plural are the same
        },
    "copy-from": "[MONSTER]", <-- behave like another monster
    "description": "[DESCRIPTION]",
    "default_faction": "cat",
    "bodytype": "quadruped",
    "categories": [ "WILDLIFE" ],
    "species": [ "MAMMAL" ],
    "weight": "2 kg",
    "hp": 8,  <-- normal zombie has 80
    "speed": 150,
    "material": [ "junk" ],
    "symbol": "%",
    "color": "magenta",
    "death_function": [ "BROKEN" ],
    "placate_triggers": [ "HURT" ],
    "flags": [ "SEES", "HEARS", "GOODHEARING", "SMELLS", "ANIMAL", "PATH_AVOID_DANGER_1", "WARM", "HIT_AND_RUN" ]
    },
*/
function generate(num){
    mons=[]
    for (let i=0;i<num;i++){
        mons.push({
            "type":"MONSTER"
        })

        makeName(i) //name first
        makeSize(i)
        makeBody(i)
        makeStats(i)
        makeSymbol(i)
        makeFaction(i)
        makeSpecies(i)
        makeHarvestType(i)
        makeFlags(i)
        makeDeathFunction(i)
        makeEmitFields(i)
        makeBabies(i)
        //makeSpecialAttacks(i) TODO: fix special attacks being invalid
        makeDescription(i) //description last
    }
    document.getElementById('monJSON').innerHTML = JSON.stringify(mons, null, 1)

    //TODO: make pretty columns to preview generated monsters
    //TODO: let user select desired monsters to include
    //TODO: combine included monsters into monsters.json and let user download
}


const vowels = 'aeiou'
const vLen = 5
const consonants = 'bcdfghjklmnpqrstvwxyz'
const cLen = 21
function makeName(index){
    let name = ''

    //names generated in consonant-vowel units
    units = randIntBetween(1, 10)

    let c = v = ''
    for (let i=0;i<units;i++){
        c = consonants[randIntBetween(0, cLen-1)]
        v = vowels[randIntBetween(0, vLen-1)]

        let add = c+v
        
        name = name+add
    }

    mons[index]['id'] = 'mon_'+name;

    let lastChar = name[name.length-1]
    let plural = 's'
    if (lastChar == 'i' || lastChar == 'o'){
        plural = 'es'
    }
    mons[index]['name'] = {
        "str": name,
        "str_pl":name + plural
    }    
}

function randIntBetween(min, max) {
    //inclusive of lower and upper limits
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function makeSize(index){
    let base = 1
    if (units < 3){
        base = 3
    } else if (units < 5){
        base = 10
    } else if (units < 8){
        base = 20
    } else if (units <= 10){
        base = 50
    }

    let weight = randIntBetween(base, base*units)
    let volume = randIntBetween(base, base*units)
    
    mons[index]['weight'] = weight+'kg'
    mons[index]['volume'] = volume+'L'
    
    let size = ''
    if (volume < 10){
        size = 'tiny'
    } else if (volume < 40){
        size = 'small'
    } else if (volume < 90){
        size = 'medium-sized'
    } else if (volume < 150){
        size = "large"
    } else {
        size = 'huge'
    }
    desc['sizeDesc'] = "A "+size+" "
}


//TODO: find bodytype definitions in respoitory
const bodies = ['angel','bear','bird','blob','crab','dog','elephant','fish','flying insect','frog',
'gator','horse','human','insect', 'kangaroo','lizard','migo','pig','spider','snake']
function makeBody(index){
    let bodytype = bodies[randIntBetween(0,bodies.length-1)]

    mons[index]['bodytype'] = bodytype
    desc['bodyDesc'] = bodytype+"-looking creature. "
}

//stat ranges based on game_balance.md, with minor modifications
function makeStats(index){
    let speed = randIntBetween(20, 300)
    mons[index]['speed'] = speed
    
    let hp = randIntBetween(10*units, 80*units)
    mons[index]['hp'] = hp

    //turns per attack = cost / speed, higher = slower attacks
    let attackCost = randIntBetween(100, 100*units)
    mons[index]['attack_cost'] = attackCost

    //higher = more aggressive
    let aggression = randIntBetween(-99, 100)
    mons[index]['aggression'] = aggression

    // 0-10, higher = more dangerous
    let meleeSkill = randIntBetween(0,units)
    let meleeDice = randIntBetween(1, Math.ceil(units/2))
    let diceSides = randIntBetween(2, 2+units)
    mons[index]['melee_skill'] = meleeSkill
    mons[index]['melee_dice'] = meleeDice
    mons[index]['melee_dice_sides'] = diceSides

    let visionDay = randIntBetween(20, 200)
    let visionNight = Math.floor(visionDay/10)
    mons[index]['vision_day'] = visionDay
    mons[index]['vision_night'] = visionNight

    let illuminates = randIntBetween(0,1)
    if (illuminates){
        let amt = randIntBetween(0,units)
        mons[index]['luminance'] = amt
    }

    let regen = randIntBetween(0,units)
    mons[index]['regenerates'] = regen
}

//TODO: find special attacks in repository
const specials = ['bite', 'scratch', 'leap']
function makeSpecialAttacks(index){
    let atk = specials[randIntBetween(0,specials.length-1)]

    let cooldown = randIntBetween(units, 20-units)

    let atkObj = {'type': atk, 'cooldown': cooldown}
    if (atk == 'leap' || atk == 'lunge'){
        let range = randIntBetween(1, units)
        atkObj['max_range'] = range
    }

    mons[index]['special_attacks'] = [atkObj]
}


const fgColours = ['black', 'red', 'green', 'blue', 'brown','cyan','light_cyan', 'magenta', 'dark_gray', 
'light_green','light_red','yellow','light_blue','pink', 'white','light_gray', 'pink']
const bgColours = ['cyan','green','magenta','red','white','yellow']
function makeSymbol(index){
    let foreground = fgColours[randIntBetween(0,fgColours.length-1)]
    let background = ''
    do {
        background = bgColours[randIntBetween(0,bgColours.length-1)]
    } while (background == foreground)
    let colour = foreground+'_'+background

    //TODO: more complex symbol generation
    let symbol = mons[index].bodytype[0]

    mons[index]['symbol'] = symbol
    mons[index]['color'] = colour
}

// TODO: get from repository: data/json/monster_factions.json
const factions = ['zombie', 'human', 'animal', 'nether', 'mutant', 'bot', 'insect','spider','fungus']
function makeFaction(index){
    let faction = factions[randIntBetween(0,factions.length-1)]
    mons[index]['default_faction'] = faction  
}

// TODO: get from repository: data/json/species.json
const speciesList = ['HUMAN', 'ROBOT', 'ZOMBIE', 'MAMMAL', 'BIRD', 'FISH', 'REPTILE', 'WORM', 'MOLLUSK',
'AMPHIBIAN', 'INSECT', 'SPIDER', 'FUNGUS', 'PLANT', 'NETHER', 'MUTANT', 'BLOB', 'HORROR', 'ABERRATION',
'HALLUCINATION', 'UNKNOWN']
function makeSpecies(index){
    let species = speciesList[randIntBetween(0,speciesList.length-1)]
    mons[index]['species'] = species
}


//TODO: get options from repository: data/json/harvest.json
const drops = ['zombie', 'arachnid','human', 'fungaloid', 'fish_large', 'mammal_large_leather','bird_large', 'mr_bones','triffid_large']
function makeHarvestType(index){
    let type = drops[randIntBetween(0,drops.length-1)]
    mons[index]['harvest'] = type
}


const onDeath = ['BLOBSPLIT','BOOMER','DISAPPEAR','FIREBALL','SMOKEBURST','FUNGUS','NORMAL', 'GUILT']
function makeDeathFunction(index){
    let numF = randIntBetween(0,Math.ceil(units/4))
    let func = []
    let temp = onDeath.slice()
    for (let i=0;i<numF;i++){
        let idx = randIntBetween(0,onDeath.length-1)
        func.push(temp[idx])
        temp.splice(idx,1)
    }

    mons[index]['death_function'] = func
}


//TODO: generate description from all notable features after everything else generated
function makeDescription(index){
    let msg = ''
    for (i in desc){
        msg = msg + desc[i]
    }
    mons[index]['description'] = msg
}   

//flag lists are manually curated
//flags relating to fighting them
const combatFlags = ['ACIDPROOF', 'ANIMAL', 'ATTACKMON', 'BLEED', 'COLDPROOF','ELECTRIC','ELECTRONIC',
 'FIREPROOF', 'FLAMMABLE', 'GRABS','HARDTOSHOOT', 'HIT_AND_RUN','NOHEAD','NO_BREATHE','PACIFIST','PARALYZE',
'PLASTIC','REVIVES','VENOM','WEBWALK']
//flags related to creature movement
const moveFlags = ['BASHES', 'CAN_OPEN_DOORS','CLIMBS','FLIES','LOUDMOVES','SWIMS','PATH_AVOID_DANGER_1', 'PATH_AVOID_DANGER_2']
//flags related to tamable creatures
const allyFlags = ['BIRDFOOD', 'CATFOOD', 'CATTLEFODDER', 'DOGFOOD','CANPLAY','PET_MOUNTABLE', 'MILKABLE',
'PET_HARNESSABLE','SHEARABLE',]
//flags related to butchery and dropped items
const deadFlags = ['BONES', 'CHITIN','FAT','FEATHER','FUR','LEATHER','POISON','WOOL']
//flags related to creature senses
const senseFlags = ['HEARS','GOODHEARING', 'KEENNOSE', 'SEES','SMELLS']

//milking products should require processing before being useful
//TODO: get options from respository: data/json/items/comestibles/brewing.json
const milkProducts = ['milk_raw', 'denat_alcohol', 'brew_pine_wine']

function makeFlags(index){
    let flags = []
    let complexity = Math.ceil(units/2)
    let temp = []

    let numSenses = randIntBetween(complexity,senseFlags.length)
    temp = senseFlags.slice()
    for (let i=0;i<numSenses;i++){
        let select = randIntBetween(0,temp.length-1)
        flags.push(temp[select])
        temp.splice(select,1)
    }

    let numDrops = randIntBetween(complexity, deadFlags.length)
    temp = deadFlags.slice()
    for (let i=0;i<numDrops;i++){
        let select = randIntBetween(0,temp.length-1)
        flags.push(temp[select])
        temp.splice(select,1)
    }

    let isAlly = randIntBetween(0,1)
    if (isAlly){
        flags.push(allyFlags[randIntBetween(0,3)]) //randomly choose taming food
        let numAlly = randIntBetween(1,complexity)
        temp = allyFlags.slice()
        for (let i=0;i<numAlly;i++){
            let select = randIntBetween(4,temp.length-1)
            flags.push(temp[select])
            if (temp[select] == 'MILKABLE'){
                let product = randIntBetween(0,milkProducts.length-1)
                let ammo = {}
                ammo[milkProducts[product]] = 5*units
                mons[index]['starting_ammo'] = ammo
                console.log(ammo)
            }
            temp.splice(select,1)
        }
    }

    let numMoves = randIntBetween(complexity, moveFlags.length)
    temp = moveFlags.slice()
    for (let i=0;i<numMoves;i++){
        let select = randIntBetween(0,temp.length-1)
        flags.push(temp[select])
        temp.splice(select,1)
    }

    let numCombat = randIntBetween(0, complexity)
    temp = combatFlags.slice()
    for (let i=0;i<numCombat;i++){
        let select = randIntBetween(0,temp.length-1)
        flags.push(temp[select])
        if (temp[select] == 'GRABS'){
            let strength = randIntBetween(1,units)
            mons[index]['grab_strength'] = strength
        }
        temp.splice(select,1)
    }

    mons[index]['flags'] = flags
}

function makeEmotionTriggers(index){
    //TODO: fear, anger, placate triggers
}


function makeBabies(index){
    let isEggLayer = randIntBetween(0,1)
    if (isEggLayer){
        //TODO: add new egg type for randomly generated monsters, replace code below
        baby = mons[index].name
    } else {
        baby = mons[index].name
    }

    count = randIntBetween(1, Math.ceil(6/units))

    timer = 30*units //in days

    //TODO: add conditional for egg layers after new egg implemented, "baby_egg"
    mons[index]['reproduction'] = {'baby_monster': baby, 'baby_count':count, 'baby_timer': timer}
}


// get from file data/json/emit.json?
const fields = ['emit_toxic_cloud', 'emit_smoke_plume', 'emit_shadow_field', 'emit_shock_burst']
function makeEmitFields(index){
    let emit = fields[randIntBetween(0,fields.length-1)]
    let delay = Math.ceil(60/units) // in minutes

    //TODO: add multiple emits for stronger monsters?

    mons[index]['emit_fields'] = [{'emit_id': emit,'delay': delay+' m'}]
}


//
//  TODO: update code to get options directly from github repository
//  TODO: add toggle for DDA or BN
//

const FLAGURL = 'https://raw.githubusercontent.com/cataclysmbnteam/Cataclysm-BN/upload/src/monstergenerator.cpp'
const COLORURL = 'https://raw.githubusercontent.com/cataclysmbnteam/Cataclysm-BN/upload/src/color.cpp'

var monsterFlags = []
var foreground = []
var background = []

var text = ''
async function getJSON(url){
    await fetch(url)
    .then(response => response.text())
    .then(result => text = result)
    return text
}

async function getMonsterFlags(){
    let flagText = await getJSON(FLAGURL)
    let textArray = flagText.split('\n') // split by new line
    let filteredButMessy = textArray.filter(str => /case MF_/g.test(str)) // filter for 'case MF_' (monster flag definition code)
    
    for (let i=0;i<filteredButMessy.length;i++){
        // example output: "        case MF_SEES: return \"SEES\";"
        // split by " char, output: [ "        case MF_SEES: return ", "SEES", ";" ]
        // monster flag at index 1, push to flag array
        monsterFlags.push(filteredButMessy[i].split('"')[1])
    }

    console.log('monsterFlags ready')
}


async function getColors(){
    let colorText = await getJSON(COLORURL)
    let textArray = colorText.split('\n')
    let filteredButMessy = textArray.filter(str => /add_color\( def_c_/g.test(str))

    let fgSet = new Set()
    let bgSet = new Set()

    for (let i = 0; i < filteredButMessy.length; i++) {
        // example output: "    add_color( def_c_black, \"c_black\", color_pair( 30 ), def_i_black );"
        // split by " char, output: [ "    add_color( def_c_black, ", "c_black", ", color_pair( 30 ), def_i_black );" ]
        // color id at index 1
        // split by _ char, output: ["c", "black"], may have 3 if has bg color
        // splice(1) to remove "c"
        let temp = filteredButMessy[i].split('"')[1].split("_").splice(1)
        //console.log(temp)
        switch(temp.length){
            case 1:
                if (!fgSet.has(temp[0])){
                    fgSet.add(temp[0])
                }
                break
            case 2:
                if (temp[0] != 'light' && temp[0] != 'dark'){ //don't separate ['light','red']
                    if (!fgSet.has(temp[0])){
                        fgSet.add(temp[0])
                    }
                    if (!bgSet.has(temp[1])){
                        bgSet.add(temp[1])
                    }
                } else {
                    let combine = temp[0]+"_"+temp[1]
                    if(!fgSet.has(combine)){
                        fgSet.add(combine)
                    }
                }
                break
            case 3:
                let combine = temp[0]+"_"+temp[1] //to recombine light_color or dark_color
                if (!fgSet.has(combine)){
                    fgSet.add(combine)
                }
                if (!bgSet.has(temp[2])){
                    bgSet.add(temp[2])
                }
                break
            default:
                console.log('get color error')
                break
        }
    }

    for (let i of fgSet.values()){
        foreground.push(i)
    }

    for (let i of bgSet.values()){
        background.push(i)
    }

    console.log('colors ready')
}