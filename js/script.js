/*
Pascal Vos
1422537vos
*/

// Via Wouter Derix ben ik aan de kaart van limburg gekomen, en heb ik de formule om de locaties beter te krijgen aangepast naar mijn situatie
// Daarnaast heeft deze website mij geholpen als referentie betreft verschillende functies: https://www.d3-graph-gallery.com

// Creert een div wat uiteindelijk gebruikt wordt door de kaart om als tooltip te functioneren
var tooltip_Map = d3.select('body').append('div')
.attr('class', 'tooltip_Map')
.style('opacity', 0);

// Creert een div wat uiteindelijk gebruikt wordt door de BarChart om als tooltip te functioneren
var tooltip_BarChart = d3.select('body').append('div')
.attr('class', 'tooltip_BarChart')
.style('opacity', 0);

//
//
// Kaart met alle WBL gemalen locaties
//
//
function generated_Map_WBL()
{
    var width = 250,
    height = 600;
    // Het aanmaken van een svg waar de kaart van limburg in gaat komen in de div map die in de index.html staat
    var svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    g = svg.append("g");

    // Zoom functie hiermee kan de gebruiker inzoomen op de map en uitzoomen om weer het orginele terug te krijgen
    var zoom = d3.zoom()
    .scaleExtent([1, 50])
    .on("zoom", function() {
        d3.event.transform.x = Math.min(0, Math.max(d3.event.transform.x, width - width * d3.event.transform.k));
        d3.event.transform.y = Math.min(0, Math.max(d3.event.transform.y, height - height * d3.event.transform.k));
        g.attr("transform", d3.event.transform);
    });
    svg.call(zoom);

    // Om in te kunnen zoomen in de kaart van limburg moet er eerst een laag gecreerd worden
    // Hiervoor moet er een soort object van de kaart gecreerd worden, zodat deze in een rechthoek geplaatst kan worden
    g.append("defs")
    .append("pattern")
    .attr('patternUnits', 'userSpaceOnUse')
    .attr("width", width)
    .attr("height", height)
    .attr("id", "background_Image")
    .append("image")
    .attr("width", width)
    .attr("height", height)
    .attr("xlink:href", "img/limburg.jpg");

    // Hier wordt de rechthoek aangemaakt in de svg met de kaart van limburg
    g.append("rect")
    .attr("width", width)
    .attr("height", height)
    // Hier wordt de def aangeroepen wat hierboven is aangemaakt
    .attr("fill", "url(#background_Image)");
    
    // Voor alle locaties wordt de longitude en latitude aangepast zodat deze de juiste afstand van elkaar krijgen
    for(var i = 0; i < WBL_Locations.length; i++)
    {
        let positionX = (((parseFloat(WBL_Locations[i].longitude) - 5) * 55) + 180 * 2);
        let positionY = (90 - ((parseFloat(WBL_Locations[i].latitude) - 50) * 78)) * 2;
        
        // Roept de functie voor de cirkels aan te maken aan
        create_Map_Circle(WBL_Locations[i].name, g, positionX, positionY);
    }
}

// Hier worden de cirkels op de kaart aangemaakt
function create_Map_Circle(WBL_Locations, g, positionX, positionY)
{
    // Nog een kleine aanpassing aan de locaties om ze op de juiste plek te krijgen
     var positionX = (positionX * 5 - 1940);
     var positionY = (positionY + 200) * 3 - 260;

     // Cirkels toevoegen aan de groep in de svg
    g.append("circle")
    .attr("cx", positionX)
    .attr("cy", positionY)
    .attr("r", 2)
    .style("fill", "black")   

    // Wanneer de gebruiker over een locatie gaat met de muis verschijnt de naam van de gemaal
    .on('mouseover', () => 
    {
        tooltip_Map.transition().duration(200).style('opacity', 0.9);
        tooltip_Map.html(`<span>${WBL_Locations}</span>`)
        .style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px")
    })
    // Tooltip verdwijnt zodra de gebruiker van de locatie af gaat
    .on('mouseout', () => 
    {
        tooltip_Map.transition().duration(500).style('opacity', 0)
    });  
}

//
//
// Deze functie haalt alle errors van WBL op voor de BarChart
// Hierbij worden ze meteen gefilterd naar de ingevoerde instellingen van de gebruiker
//
//
function load_Errors_BarChart()
{
    // Haalt de waardes op wat de gebruiker heeft ingevoerd op de webpagina
    var min = document.getElementById("min_Errors");
    var min_Errors = min.value;
    var max = document.getElementById("max_Errors");
    var max_Errors = max.value;
    var selected_Location = document.getElementById("dropdown_Location");
    var location = selected_Location.options[selected_Location.selectedIndex].value;

    location_List = [];
    // Haalt de WBL errors op en filtert puur de locaties eruit die meldingen hebben 
    for(var i = 0; i < WBL_Errors.length; i++)
    {
        var source = WBL_Errors[i].source;
        var result_Source = source.slice(10);
        result = result_Source.substring(0, result_Source.indexOf('\\'));

        // Controleert of de locatie al in de lijst staat,
        // er mag namelijk maar van elke locatie 1 in de lijst komen
        if(location_List.includes(result))
        {

        }
        else
        {
            location_List.push(result);
        }
    }

    // Hier worden alle locaties die in de location_List staan in de dropdown op de webpagina geplaatst
    var dropdown_Box = document.getElementById('dropdown_Location');
    for(var i = 0; i < location_List.length; i++)
    {
        var opt = document.createElement('option');
        opt.innerHTML = location_List[i];
        opt.value = location_List[i];
        dropdown_Box.appendChild(opt);
    }

    // Haalt de WBL errors op en filtert puur de soorten meldingen eruit 
    error_Number_List = [];
    var error_List = [];
    for(var i = 0; i < WBL_Errors.length; i++)
    {
        // Controleert of de melding al in de lijst staat,
        // er mag namelijk maar van elke melding 1 in de lijst komen
        if(error_List.includes(WBL_Errors[i].message))
        {

        }
        else
        {
            error_List.push(WBL_Errors[i].message);
        }
    }

    // Haalt de WBL errors op en filtert
    var current_Error;
    var count = 0;
    // Voor elke gevonden melding in error_List gaat hij de WBL error lijst doorzoeken en tellen
    for(var i = 0; i < error_List.length; i++)
    {
        var timestamp = WBL_Errors[0].timestamp;
        count = 0;
        // Voor elke WBL error wordt er op bepaalde criteria gefilterd
        for(var j = 0; j < WBL_Errors.length; j++)
        {
            // Hier worden de meldingen gefilterd op de locatie wat de gebruiker heeft ingevoerd
            if(location != "Allemaal")
            {
                if(WBL_Errors[j].source.includes(location))
                {
                    // Hier worden de meldingen gefilterd op de soort melding
                    if(WBL_Errors[j].message == error_List[i])
                    {        
                        // Als laatste wordt er gekeken wanneer de timestamp veranderd 
                        // Dit zorgt ervoor dat er geen dubbelen meldingen geteld worden omdat sommige meldingen vaker per min worden gelogt  
                        if(WBL_Errors[j].timestamp != timestamp)
                        {
                            count = count + 1;
                            timestamp = WBL_Errors[j].timestamp;
                        }
                    }
                }      
            }
            else
            {
                // Hier worden de meldingen gefilterd op de soort melding
                if(WBL_Errors[j].message == error_List[i])
                {
                    // Als laatste wordt er gekeken wanneer de timestamp veranderd 
                    // Dit zorgt ervoor dat er geen dubbelen meldingen geteld worden omdat sommige meldingen vaker per min worden gelogt  
                    if(WBL_Errors[j].timestamp != timestamp)
                    {
                        count = count + 1;
                        timestamp = WBL_Errors[j].timestamp;
                    }
                }
            } 
        }
        current_Error = error_List[i];
        // Als laatste wordt de melding met de totaal aantal naar de Error_Number_List gepusht
        // De BarChart gaat deze lijst uiteindelijk verwerken
        if(count > min_Errors && count < max_Errors)
        {
            error_Number_List.push({"soort": current_Error, "aantal": count})
        }  
    }
}

// BarChart variabelen die ook in anderen functies gebruikt worden
var xAxis;
var yAxis;
var x;
var y;
var svg_BarChart;

// BarChart wordt hier aangemaakt
function create_BarChart()
{
    var margin = {top: 30, right: 30, bottom: 70, left: 220},
        width = 500,
        height = 400;

    // Het aanmaken van een svg waar de barchart in gaat komen in de div barChart die in de index.html staat
    svg_BarChart = d3.select("#barChart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Hier wordt de x Axis aangemaakt, waarbij het eind punt de hoogste aantal errors van de huidige data set pakt  
    x = d3.scaleLinear()
        .domain([0, Math.max.apply(Math, error_Number_List.map(function(d) { return d.aantal; }))])
        .range([0 , width]);
    xAxis = svg_BarChart.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    // Hier wordt de y Axis aangemaakt, waarbij alle punten een soort error krijgt van de huidige data set  
    y = d3.scaleBand()
        .range([height, 0])
        .domain(error_Number_List.map(function(d) { return d.soort; }))
        .padding(0.2);
    yAxis = svg_BarChart.append("g")
    .attr("class", "axisY")
    .call(d3.axisLeft(y));
}

// Zodra er op de knop updateBarChart vanuit de index.html gedrukt wordt de BarChart geupdate
function updateBarChart(data) 
{
    // De x Axis updaten
    x.domain([0, d3.max(data, function(d) { return d.aantal }) ]);
    xAxis.call(d3.axisBottom(x))

    // De y Axis updaten
    y.domain(data.map(function(d) { return d.soort; }))
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // Alle rects worden in de variabel bars gestopt
    var bars = svg_BarChart.selectAll("rect")
    .data(data)
    bars
    .enter()
    .append("rect")
    // Wanneer de gebruiker over een Bar gaat met de muis verschijnt hoe vaak de error is voorgekomen
    .on('mouseover', function(d)
    {
        tooltip_BarChart.transition().duration(200).style('opacity', 0.9);
        tooltip_BarChart.html(`<span>${d.aantal}</span>`)
        .style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px")
    })
    // Tooltip verdwijnt zodra de gebruiker van de Bar af gaat
    .on('mouseout', () => 
    {
        tooltip_BarChart.transition().duration(500).style('opacity', 0)
    }) 
    // Hier worden alle bars samengevoegd, gebruiker ziet dit gebeuren aan de hand van een animatie
    .merge(bars)
    .transition()
    .duration(1000)
        .attr("x", x(0) )
        .attr("y", function(d) { return y(d.soort); })
        .attr("width", function(d) { return x(d.aantal); })
        .attr("height", y.bandwidth() )
        .attr("fill", "#92A1CF")
    
    // Hier worden de bars die niet meer gebruikt worden verwijderd
    bars
    .exit()
    .remove()
}

//
//
// Deze functie haalt alle errors van WBL op voor de BarChart
// Hierbij worden ze meteen gefilterd naar de ingevoerde instellingen van de gebruiker
//
//
function load_Errors_Circle_BarChart()
{
    // Haalt de waardes op wat de gebruiker heeft ingevoerd op de webpagina
    var select_Error_Dropdown = document.getElementById("dropdown_Errors");
    var selected_Error = select_Error_Dropdown.options[select_Error_Dropdown.selectedIndex].value;

    // Haalt de WBL errors op en filtert puur de soorten meldingen eruit 
    error_Number_List_Circle_BarChart = [];
    var error_List = [];
    for(var i = 0; i < WBL_Errors.length; i++)
    {
        // Controleert of de melding al in de lijst staat,
        // er mag namelijk maar van elke melding 1 in de lijst komen
        if(error_List.includes(WBL_Errors[i].message))
        {

        }
        else
        {
            error_List.push(WBL_Errors[i].message);
        }
    }

    // Hier worden alle meldingen die in de error_List staan in de dropdown op de webpagina geplaatst
    var dropdown_Box = document.getElementById('dropdown_Errors');
    // Alle meldingen sorteren op alphabet 
    error_List.sort();
    for(var i = 0; i < error_List.length; i++)
    {
        var opt = document.createElement('option');
        opt.innerHTML = error_List[i];
        opt.value = error_List[i];
        dropdown_Box.appendChild(opt);
    }

    location_List = [];
    // Haalt de WBL errors op en filtert puur de locaties eruit die meldingen hebben 
    for(var i = 0; i < WBL_Errors.length; i++)
    {
        var source = WBL_Errors[i].source;
        var result_Source = source.slice(10);
        result = result_Source.substring(0, result_Source.indexOf('\\'));

        // Controleert of de locatie al in de lijst staat,
        // er mag namelijk maar van elke locatie 1 in de lijst komen
        if(location_List.includes(result))
        {

        }
        else
        {
            location_List.push(result);
        }
    }

    // Haalt de WBL errors op en filtert
    var current_Location;
    var count = 0;
    // Voor elke gevonden melding in location_List gaat hij de WBL error lijst doorzoeken en tellen
    for(var i = 0; i < location_List.length; i++)
    {
        var timestamp = WBL_Errors[0].timestamp;
        count = 0;
        // Voor elke WBL error wordt er op bepaalde criteria gefilterd
        for(var j = 0; j < WBL_Errors.length; j++)
        {
            // Hier worden de meldingen gefilterd op de melding wat de gebruiker heeft ingevoerd
            if(selected_Error != "Allemaal")
            {
                // Hier worden de meldingen gefilterd op locatie
                var source = WBL_Errors[j].source;
                var result_Source = source.slice(10);
                result = result_Source.substring(0, result_Source.indexOf('\\'));
                
                if(WBL_Errors[j].message == selected_Error)
                {
                    if(result == location_List[i])
                    {
                        // Als laatste wordt er gekeken wanneer de timestamp veranderd 
                        // Dit zorgt ervoor dat er geen dubbelen meldingen geteld worden omdat sommige meldingen vaker per min worden gelogt  
                        if(WBL_Errors[j].timestamp != timestamp)
                        {
                            count = count + 1;
                            timestamp = WBL_Errors[j].timestamp;
                        }
                    }  
                }      
            }
            else
            {
                // Hier worden de meldingen gefilterd op locatie
                var source = WBL_Errors[j].source;
                var result_Source = source.slice(10);
                result = result_Source.substring(0, result_Source.indexOf('\\'));
        
                if(result == location_List[i])
                {
                    // Als laatste wordt er gekeken wanneer de timestamp veranderd 
                    // Dit zorgt ervoor dat er geen dubbelen meldingen geteld worden omdat sommige meldingen vaker per min worden gelogt  
                    if(WBL_Errors[j].timestamp != timestamp)
                    {
                        count = count + 1;
                        timestamp = WBL_Errors[j].timestamp;
                    }
                }      
            } 
        }
        current_Location = location_List[i];
        // Als laatste wordt de melding met de totaal aantal naar de error_Number_List_Circle_BarChart gepusht
        // De Cirkel BarChart gaat deze lijst uiteindelijk verwerken
        error_Number_List_Circle_BarChart.push({"locatie": current_Location, "aantal": count})
    }
}

// Cirkel BarChart variabelen die ook in anderen functies gebruikt worden
var xCircleChart;
var yCircleChart;
var svg_Circle_BarChart;
var innerRadius;
var outerRadius;

// Cirkel BarChart wordt hiet aangemaakt
function create_Circle_BarChart()
{
    var margin = {top: 10, right: 0, bottom: 0, left: 0},
        width = 460 - margin.left - margin.right,
        height = 460 - margin.top - margin.bottom;
    innerRadius = 50;
    outerRadius = 170;
    
    // Het aanmaken van een svg waar de cirkel barchart in gaat komen in de div circle_BarChart die in de index.html staat
    svg_Circle_BarChart = d3.select("#circle_BarChart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

    // Hier wordt de xCircleChart aangemaakt, met als domein alle locaties  
    xCircleChart = d3.scaleBand()
        // De x as gaat van 0 tot 2 pi. om een hele cirkel te krijgen moet het op 2 staan. 1 is namelijk alleen de helft van de cirkel
        .range([0, 2 * Math.PI])
        .domain(error_Number_List_Circle_BarChart.map(function(d) { return d.locatie; })); 

    // Hier wordt de yCircleChart aangemaakt, met als domein de maximale aantal meldingen van alle locaties
    yCircleChart = d3.scaleRadial()
    .range([innerRadius, outerRadius])
    .domain([0, d3.max(error_Number_List_Circle_BarChart, function(d) { return d.aantal })]);
}

// Zodra er op de knop updateCircleBarChart vanuit de index.html gedrukt wordt de Cirkel BarChart geupdate
function updateCircleBarChart(data) 
{
    // De yCircleChart updaten
    yCircleChart.domain([0, d3.max(data, function(d) { return d.aantal }) ]);

    // Voeg de bars met de groote van de value toe aan de cirkel
    svg_Circle_BarChart.append("g");
    var bars = svg_Circle_BarChart.selectAll("path")
    .data(data)
    bars
    .enter()
    .append("path")
    // Wanneer de gebruiker over een Bar gaat met de muis verschijnt hoe vaak de melding is voorgekomen
    .on('mouseover', function(d)
    {
        tooltip_BarChart.transition().duration(200).style('opacity', 0.9);
        tooltip_BarChart.html(`<span>${d.aantal}</span>`)
        .style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px")
    })
    // Tooltip verdwijnt zodra de gebruiker van de Bar af gaat
    .on('mouseout', () => 
    {
        tooltip_BarChart.transition().duration(500).style('opacity', 0)
    }) 
    .merge(bars)
    .attr("fill", "#CCBB93")
    .style("stroke", "white")
    .attr("d", d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(function(d) { return yCircleChart(d['aantal']); })
        .startAngle(function(d) { return xCircleChart(d.locatie); })
        .endAngle(function(d) { return xCircleChart(d.locatie) + xCircleChart.bandwidth(); })
        .padAngle(0.01)
        .padRadius(innerRadius))
    bars
    .exit()
    .remove();
    
    // Verwijder voor het updaten eerst alle bestaande labels
    svg_Circle_BarChart.selectAll("text").remove();

    // Voeg de nieuwe labels toe op de juiste locatie
    svg_Circle_BarChart.append("g")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
        .attr("text-anchor", function(d) { return (xCircleChart(d.locatie) + xCircleChart.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        .attr("transform", function(d) { return "rotate(" + ((xCircleChart(d.locatie) + xCircleChart.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (yCircleChart(d['aantal'])+10) + ",0)"; })
    .append("text")
        .text(function(d){return(d.locatie)})
        .attr("transform", function(d) { return (xCircleChart(d.locatie) + xCircleChart.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
        .style("font-size", "11px")
        .attr("alignment-baseline", "middle")  
}
 
// Roept generated_Map_WBL functie van de map aan, dit zorgt ervoor dat er een map verschijnt bij het laden van de pagina
generated_Map_WBL();

// Roept load_Errors_BarChart functie van de BarChart aan, dit zorgt ervoor dat de data uit de WBL_Errors file geladen wordt bij laden van de pagina
load_Errors_BarChart();

// Roept create_BarChart functie van de BarChart aan, dat ervoor zorgt dat de svg waar de BarChart inkomt gecreëerd wordt bij laden van de pagina
create_BarChart();

// Roept update functie van de BarChart aan, dat ervoor zorgt dat de BarChart een dataset heeft bij laden van de pagina
updateBarChart(error_Number_List)

// Roept load_Errors_Circle_BarChart functie van de Cirkel BarChart aan, dit zorgt ervoor dat de data uit de WBL_Errors file geladen wordt bij laden van de pagina
load_Errors_Circle_BarChart();

// Roept create_Circle_BarChart functie van de Cirkel BarChart aan, dat ervoor zorgt dat de svg waar de cirkel BarChart inkomt gecreëerd wordt bij laden van de pagina
create_Circle_BarChart();

// Roept update functie van de Cirkel BarChart aan, dat ervoor zorgt dat de Cirkel BarChart een dataset heeft bij laden van de pagina
updateCircleBarChart(error_Number_List_Circle_BarChart);