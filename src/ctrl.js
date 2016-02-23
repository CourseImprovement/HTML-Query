var app = angular.module('app', []);

app.controller('mainCtrl', function($scope){

	$scope.queries = [
		{
			name: 'Hyperlinks',
			value: 'a[href]'
		}
	];

	$scope.queried = [];

	var results = [];
	var inProgress = false;
	var runQuery = false;

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
	        	var fileName = theFile.name;
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
	            
	          }
	        }
	      })(f);

	      reader.readAsArrayBuffer(f);
			}
		})
	}, 100);

	function query(){
		var val = $('.dropdown').dropdown('get value');
		if (val.length > 0 && val[0] && val[0].length > 0){
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
		    var queryResults = $(xmlDoc).find(val[0]);
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

});