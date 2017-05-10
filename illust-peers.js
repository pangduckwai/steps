
PeersIllustrator = function(chartId) {
	this.id = "illust-peers"; //Chart ID
	this.domId = (!chartId) ? this.id : chartId; //Element ID in DOM
	this.name = "Peers illustrator";
	this.url = "http://192.168.14.130:8080/ws/temp2"; //"%%%urlPeers%%%";
	this.minGridWdth = 3;
	this.minGridHght = 3;
	this.updateInterval = 2000;

	var radius;
	var arc;
	var pie;
	var line;

	var grph;
	var _this = this;

	this.init = function() {
		radius = Math.min(this.chartWdth*3/4, this.chartHght) / 2;

		pie = d3.layout.pie()
			.sort(null)
			.value(function(d) { return 1; });

		arc = d3.svg.arc()
			.outerRadius(radius * 0.7)
			.innerRadius(radius * 0.7);

		line = d3.svg.line();

		grph = d3.select("#"+this.domId).select(".chart-viz");
	};

	this.render = function() {
		accessData(this.url, function(rspn) {
				var rnode = grph.select(".peers");
				if (rnode.empty()) {
					rnode = grph.append("g").attr("class", "peers").attr("transform", "translate(" + (_this.chartWdth / 2) + ", " + (_this.chartHght / 2) + ")");
				}

				var names = new Set();
				var rotat = Math.PI / rspn.peers.length;
				var nodes = pie(rspn.peers).map(function(d) {
						d.startAngle -= rotat;
						d.endAngle -= rotat;
						names.add(d.data.ID.name);
						return d;
				});

				var peers = rnode.selectAll(".peer").data(nodes, function(d) { return d.data.pkiID; });
				var peer = peers.enter().append("g").attr("class", "peer");
				peer.append("circle").attr("class", "block-rect")
					.attr("cx", 0).attr("cy", 0).attr("r", 5);
				peer.append("text").attr("class", "block-text").attr("text-anchor", "middle").attr("dominant-baseline", "middle")
					.text(function(d, i) { return d.data.ID.name; });

				peers.exit().remove();

				peers.select("text")
					.attr("dx", function(d) { return  21 * Math.sin((d.endAngle - d.startAngle) / 2 + d.startAngle); })
					.attr("dy", function(d) { return -21 * Math.cos((d.endAngle - d.startAngle) / 2 + d.startAngle); });

				peers.transition().duration(_this.updateInterval)
					.attrTween("transform", function(d) {
						this._current = this._current || d;
						var intr = d3.interpolate(this._current, d);
						this._current = intr(0);
						return function(t) {
							var val = intr(t);
							var pos = arc.centroid(val);
							//pos[0] = radius * (val.startAngle < Math.PI ? 1 : -1);
							return "translate(" + pos + ")";
						};
				});

				// Manage the lines between the nodes
				var p0, p1;
				var pth = rnode.selectAll(".peer-line");
				var regex = /^peer-line f([_a-zA-Z0-9-]+) t([_a-zA-Z0-9-]+)$/;
				var lne, mth;
				pth.each(function(d, i) {
						lne = d3.select(this);
						mth = regex.exec(lne.attr("class"));
						if (mth != null) {
							if (!names.has(mth[1]) || !names.has(mth[2])) {
								lne.remove();
							}
						}
				});

				for (var i = 0; i < nodes.length; i ++) {
					p0 = arc.centroid(nodes[i]);
					for (var j = 0; j < i; j ++) {
						p1 = arc.centroid(nodes[j]);
						pth = rnode.select(".peer-line.f" + nodes[i].data.ID.name + ".t" + nodes[j].data.ID.name);
						if (pth.empty()) {
							pth = rnode.append("path")
								.attr("class", "peer-line f" + nodes[i].data.ID.name + " t" + nodes[j].data.ID.name);
						}
						pth.transition().duration(_this.updateInterval)
							.attr("d", line([p0, p1]))
							.style("opacity", 1);
					}
				}
		});
	};

	this.buildUi = function(func) {
		func('<div class="chart-title"></div><svg class="chart-viz" />');
	};

	this.fromCookie = function(cook) {
	};

	this.toCookie = function(row, col, wdth, hght) {
		var cook = {};
		cook[KEY_CHART] = this.id;
		cook[KEY_ROW] = row;
		cook[KEY_COL] = col;
		cook[KEY_WDTH] = wdth;
		cook[KEY_HGHT] = hght;
		return cook;
	};

};
PeersIllustrator.prototype = new Chart();
PeersIllustrator.prototype.constructor = PeersIllustrator;
addAvailableCharts(new PeersIllustrator());