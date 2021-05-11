export var pointTooltips = function (tooltip) {
    // Tooltip Element
    var tooltipEl = document.getElementById('chartjs-tooltip');

    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.innerHTML = '<table></table>';
        this._chart.canvas.parentNode.appendChild(tooltipEl);
    }

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }

    // Set caret Position
    tooltipEl.classList.remove('above', 'below', 'no-transform');
    if (tooltip.yAlign) {
        tooltipEl.classList.add(tooltip.yAlign);
    } else {
        tooltipEl.classList.add('no-transform');
    }

    function getBody(bodyItem) {
        return bodyItem.lines;
    }

    // Set Text
    if (tooltip.body) {
        var bodyLines = tooltip.body.map(getBody);

        // If there is no content do not display
        if (bodyLines.length === 0) {
            tooltipEl.style.opacity = 0;
            return;        
        }

        var innerHtml = '<thead>';

        innerHtml += '</thead><tbody>';

        bodyLines.forEach(function (body, i) {
            var colors = tooltip.labelColors[i];
            var style = 'background:' + colors.backgroundColor;
            style += '; border-color:' + colors.borderColor;
            style += '; border-width: 2px';
            var span =
                '<span class="chartjs-tooltip-key" style="' +
                style +
                '"></span>';
            innerHtml += span + body ;
        });
        innerHtml += '</tbody>';

        var tableRoot = tooltipEl.querySelector('table');
        tableRoot.innerHTML = innerHtml;
    }

    var positionY = this._chart.canvas.offsetTop;
    var positionX = this._chart.canvas.offsetLeft;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
    tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
    tooltipEl.style.fontStyle = 'var(--roboto)';
    tooltipEl.style.fontWeight = '500';
    tooltipEl.style.color = 'var(--dark-text-tooltip)';
    tooltipEl.style.padding = '13px 13px';
    tooltipEl.style.background = '#FFFFFF';
    tooltipEl.style.border = '1px solid #E1E3E7';
    tooltipEl.style.boxSizing = 'border-box';
    tooltipEl.style.boxShadow = '0px 0px 2px rgba(0,0,0,0.12)';
    tooltipEl.style.borderRadius = '4px';
};
