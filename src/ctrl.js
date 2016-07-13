var app = angular.module('app', []);

app.controller('mainCtrl', function($scope){

	$scope.queries = [
		{
			name: 'Hyperlinks',
			value: 'a[href]',
			valueType: 'attr',
			valueText: 'href'
		}
	];

	$scope.queried = [];

	var results = [];
	var inProgress = false;
	var runQuery = false;
	var fileName = '';

	setTimeout(function(){
		$('.dropdown').dropdown({
			onChange: function(){
				if (runQuery) query();
			}
		});
		$('#file').change(function(e){
			var files = e.target.files;
			for (var i = 0; i < files.length; i++){
				var f = files[i];
				var reader = new FileReader();
				reader.onload = (function(theFile) {
	        return function(e) {
	        	fileName = theFile.name;
	          try {
	            // read the content of the file with JSZip
	            var zip = new JSZip(e.target.result);

	            inProgress = true;

	            // that, or a good ol' for(var entryName in zip.files)
	            $.each(zip.files, function (index, zipEntry) {
	              if (zipEntry.name.indexOf('htm') > 0){
	              	results.push(zipEntry);
	              }
	            });

	            inProgress = false;
	            query();

	          } catch(e) {
	            console.log(e);
	          }
	        }
	      })(f);

	      reader.readAsArrayBuffer(f);
			}
		})
	}, 100);

	function query(){
		var down = $('.dropdown').dropdown('get value');
		var val = $scope.queries[parseInt(down)].value;
		if (val.length > 0 && val && val.length > 0){
			var queried = [];
			for (var i = 0; i < results.length; i++){
				var xmlStr = results[i].asText();
				var parser, xmlDoc;
		    if(window.DOMParser) {
		        parser = new DOMParser();
		        xmlDoc = parser.parseFromString(xmlStr, "text/html");
		    } else {
		        xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		        xmlDoc.async = false;
		        xmlDoc.loadXML(xmlStr); 
		    }
		    var queryResults = [];
		    $(xmlDoc).find(val).each(function(){
		    	queryResults.push(printValue(this));
		    })
		    if (queryResults.length == 0) continue;

				queried.push({
					zip: results[i],
					results: queryResults
				});
			}
			$scope.$apply(function(){
				$scope.queried = queried;
			})
		}
		else{
			alert('Select a Query');
			runQuery = true;
		}
	}

	$scope.loadFile = function(){
		$('#file').click();
	}

	$scope.export = function(){
		var csv = 'D2L Location, href';
		for (var i = 0; i < $scope.queried.length; i++){
			var name = $scope.queried[i].zip.name;
			for (var j = 0; j < $scope.queried[i].results.length; j++){
				var val = $scope.queried[i].results[j];
				if (val.indexOf(',') > 0){
					val = '"' + val + '"';
				}
				csv += '\n' + name + ', ' + val;
			}
		}
		var a         = document.createElement('a');
		a.href        = 'data:attachment/csv,' +  encodeURIComponent(csv);
		a.target      = '_blank';
		a.download    = fileName + '.csv';
		a.style.display = 'none';

		document.body.appendChild(a);
		a.click();
	}

	function printValue(ele){
		var down = $('.dropdown').dropdown('get value');
		var val = $scope.queries[parseInt(down)];
		switch (val.valueType){
			case 'attr': {
				return $(ele).attr(val.valueText);
			}
		}
	}

});