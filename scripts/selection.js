var selCases = [1, 2];

function updateTitle() {
    var algs = Object.keys(scramblesMap).length;
    if (!currentSettings.showDots) {
        algs -= optionalAlgsCount;
    }
    var allSelector = document.getElementById('allSelector');
    if (selCases.length == algs) {
        allSelector.className = 'borderedContainer itemSel pad';
    } else {
        allSelector.className = 'borderedContainer itemUnsel pad';
    }
    document.getElementById("csi").innerHTML = selCases.length;
}

function itemClicked(i) {
    if (window.scramblesMap[i] == null) {
        console.error("is null");
        return;
    }

    var index = window.selCases.indexOf(i);
    var wasSelected = (index != -1);
    if (wasSelected)
        selCases.splice(index, 1);
    else
        selCases.push(i);
    var element = document.getElementById("itemTd" + i);
    element.className = (wasSelected ? "itemUnsel" : "itemSel") + " borderedContainer";
    var groupElement = element.parentElement.previousElementSibling;
    var groupWasSelected = groupElement.classList[1] == 'itemSel';
    if (groupWasSelected && wasSelected) {
        groupElement.className = 'borderedContainer itemUnsel pad';
    } 
    if (!groupWasSelected && !wasSelected) {
        var groupElements = element.parentElement.childNodes;
        var selectedCount = 0;
        for (var i = 0; i < groupElements.length; i++) {
            selectedCount += groupElements[i].classList[0] == 'itemSel';
        }
        if (selectedCount == groupElements.length) {
            groupElement.className = 'borderedContainer itemSel pad';
        }
    }
    saveSelection();
    updateTitle();
}

function selectAllNone() {
    var nothingSelected = (window.selCases.length == 0);
    var algs = Object.keys(scramblesMap).length;
    if (!currentSettings.showDots) {
        algs -= optionalAlgsCount;
    }
    if (nothingSelected) {
        for (var i = 1; i <= algs; ++i)
            selCases.push(i);
    } else {
        selCases = [];
    }
    renderSelection();
    saveSelection();
}

/// \returns true if at least one case selected in group groupName
function isAtLeastOneSelected(groupName) {
    var indeces = algsGroups[groupName];
    for (var i in indeces) {
        if (selCases.indexOf(indeces[i]) != -1)
            return true;
    }
    return false;
}

// select or deselect all cases in the group
function selectCaseGroup(name) {
    var aos = isAtLeastOneSelected(name);
    var indeces = algsGroups[name];
    for (i in indeces) {
        if (aos) { // need to delete
            var j = selCases.indexOf(indeces[i]);
            if (j != -1)
                selCases.splice(j, 1);
        } else { // need to add
            selCases.push(indeces[i]);
        }
    }
    renderSelection();
    saveSelection();
}

function makeDivNormal(groupname) {
    var s = "";
    var indeces = algsGroups[groupname];
    
    s += " onclick='selectCaseGroup(\"" + groupname
        + "\")'><b>" + groupname + "</b></div>";
    s += "<div class='rowFlex' style='flex-wrap: wrap'>";
    var allSelected = true;
    for (var j = 0; j < indeces.length; j++) {
        var i = indeces[j]; // case number
        var sel = (selCases.indexOf(i) != -1);
        allSelected &= sel;
        s += "<div id='itemTd" + i + "' ondblclick='showHint(this, " + i + ")' onclick='itemClicked(" + i + ")' class='" + (sel ? "itemSel" : "itemUnsel") + " borderedContainer' title='" + algsInfo[i]["name"] + "'>" +
            "<img class='caseImage' id='sel" + i + "' src='pic/" + i + ".svg' ></div>";
    }
    s = "<div class='colFlex' style='width: fit-content'> <div class='borderedContainer " + (allSelected ? "itemSel" : "itemUnsel") + " pad'" + s;
    s += "</div></div>";
    return s;
}

function ensureSelectionMatchesShown() {
    var algs = Object.keys(scramblesMap).length;
    if (!currentSettings.showDots) {
        algs -= optionalAlgsCount;
    };
    var newSelected = selCases.filter((value) => {return value <= algs;}) 
    selCases = newSelected;
}  


/// iterates the scramblesMap and highlights HTML elements according to the selection
function renderSelection() {
    var algs = Object.keys(scramblesMap).length;
    if (!currentSettings.showDots) {
        algs -= optionalAlgsCount;
    }
    var s = "";
    s += "<div id='allSelector' class='borderedContainer  "+ (selCases.length == algs ? "itemSel" : "itemUnsel") + " pad' onclick='selectAllNone()'><b>All Cases (" + algs + ")</b> | selected: <span id='csi'></span></div>";

    for (const key of Object.keys(algsGroups)) {
        if (currentSettings.showDots || !(optionalGroups.includes(key))) {
            s += makeDivNormal(key)
        }
    }

    document.getElementById("cases_selection").innerHTML = s;
    ensureSelectionMatchesShown();
    updateTitle();
}


function saveSelection() {
    localStorage.setItem(selectionArrayKey, JSON.stringify(selCases));
}

function loadSelection() {
    var cases = loadLocal(selectionArrayKey);
    if (cases != null)
        selCases = JSON.parse(cases);
}
