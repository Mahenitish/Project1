/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/task', 'N/error', 'N/runtime', 'N/search', 'N/record', 'N/url'], function (serverWidget, task, error, runtime, search, record, url) {
	function onRequest(context) {

		try {
			debugger
			var host = url.resolveDomain({ hostType: url.HostType.APPLICATION });
			var params = context.request.parameters;
			var url_header = "https://" + host + "/app/common/search/searchresults.nl?searchtype="


			var scriptObj = runtime.getCurrentScript();
			var jsonString = scriptObj.getParameter({ name: 'custscript_saved_search_ids' });
			log.debug('Obj', typeof (jsonString))
			var jsonData = JSON.parse(jsonString);
			log.debug('jsonData', jsonData)

			var record_type = {
				"contact": ["&Entity_DATECREATEDfrom=", "&Entity_DATECREATEDto=", "&Entity_DATECREATEDmodi=WITHIN&Entity_DATECREATED=CUSTOM&searchid="],
				"customer": ["&Entity_DATECREATEDfrom=", "&Entity_DATECREATEDto=", "&Entity_DATECREATEDmodi=WITHIN&Entity_DATECREATED=CUSTOM&searchid="],
				"vendor": ["&Entity_DATECREATEDfrom=", "&Entity_DATECREATEDto=", "&Entity_DATECREATEDmodi=WITHIN&Entity_DATECREATED=CUSTOM&searchid="],
				"employee": ["&Entity_DATECREATEDfrom=", "&Entity_DATECREATEDto=", "&Entity_DATECREATEDmodi=WITHIN&Entity_DATECREATED=CUSTOM&searchid="],
				"project": ["&Entity_DATECREATEDfrom=", "&Entity_DATECREATEDto=", "&Entity_DATECREATEDmodi=WITHIN&Entity_DATECREATED=CUSTOM&searchid="],
				"partner": ["&Entity_DATECREATEDfrom=", "&Entity_DATECREATEDto=", "&Entity_DATECREATEDmodi=WITHIN&Entity_DATECREATED=CUSTOM&searchid="],
				"group": ["&Entity_DATECREATEDfrom=", "&Entity_DATECREATEDto=", "&Entity_DATECREATEDmodi=WITHIN&Entity_DATECREATED=CUSTOM&searchid="],
				"item": ["&Item_CREATEDfrom=", "&Item_CREATEDto=", "&Item_CREATEDmodi=WITHIN&Item_CREATED=CUSTOM&searchid="],
				"noninventoryitem": ["&Item_CREATEDfrom=", "&Item_CREATEDto=", "&Item_CREATEDmodi=WITHIN&Item_CREATED=CUSTOM&searchid="],
				"salesorder": ["&Transaction_DATECREATEDfrom=", "&Transaction_DATECREATEDto=", "&Transaction_DATECREATEDmodi=WITHIN&Transaction_DATECREATED=CUSTOM&searchid="],
				"customrecord_integration_error_log": ["/app/common/search/searchresults.nl?rectype=104&searchtype=", "&Custom_CREATEDfrom=", "&Custom_CREATEDto=", "&CUSTRECORD_RECORD_TYPE=", "&CUSTRECORD_SOURCE_SYSTEM=", "&Custom_CREATEDmodi=WITHIN&Custom_CREATED=CUSTOM&CUSTRECORD_RECORD_TYPEtype=STARTSWITH&searchid="],
				"customrecord_streams_integrationerrorlog": ['/app/common/search/searchresults.nl?rectype=104&searchtype=', '&Custom_CREATEDfrom=', '&Custom_CREATEDto=', '&CUSTRECORD_STREAMS_RECORD_TYPE=', '&CUSTRECORD_STREAMS_SOURCE_SYSTEM=', '&Custom_CREATEDmodi=WITHIN&Custom_CREATED=CUSTOM&CUSTRECORD_STREAMS_RECORD_TYPEtype=STARTSWITH&searchid=']
			}

			var Start_Date = params.Start_Date;
			log.debug('Start Date', Start_Date)
			var End_Date = params.End_Date;
			log.debug('End Date', End_Date)

			if (context.request.method === 'GET') {
				var form = serverWidget.createForm({
					title: 'Integration Dashboard',
				});

				// form.clientScriptModulePath = "./NS_SF_Accelerator_Dashboard_Suitlet_CS.js";
				form.clientScriptModulePath = "SuiteBundles/Bundle 531480/NS_SF_Accelerator_Dashboard_Suitlet_CS.js";

				var Date = form.addFieldGroup({
					id: 'dategroup',
					label: 'Date'
				});

				var Date_from = form.addField({
					id: 'custpage_date_from',
					type: serverWidget.FieldType.DATE,
					label: 'From',
					container: 'dategroup',
				});
				if (Start_Date) {
					Date_from.defaultValue = Start_Date
				}
				// else {
				// 	Date_from.defaultValue = new Date()
				// }
				Date_from.updateBreakType({
					breakType: serverWidget.FieldBreakType.STARTCOL
				});

				var Date_to = form.addField({
					id: 'custpage_date_to',
					type: serverWidget.FieldType.DATE,
					label: 'To',
					container: 'dategroup',
				});
				Date_to.updateBreakType({
					breakType: serverWidget.FieldBreakType.STARTCOL
				});
				if (End_Date) {
					Date_to.defaultValue = End_Date
				}

				for (var i = 0; i < jsonData.length; i++) {
					try {

						var searchObject = jsonData[i][Object.keys(jsonData[i])[0]];
						log.debug("Name: " + searchObject.Name);
						log.debug("Success: " + searchObject.Success);
						log.debug("Failed: " + searchObject.Failed);
						log.debug("Source: " + searchObject.Source);
						log.debug("Destination: " + searchObject.Destination);

						var Source = searchObject.Source
						var Destination = searchObject.Destination;


						if (searchObject.Success && searchObject.Failed) {
							var ns_response = ('<!DOCTYPE html> ')
							ns_response += ('<head> ')
							ns_response += ('<style type="text/css">')
							ns_response += ('tr.uir-fieldgroup-content td{width:100%!important}')
							ns_response += ('tbody .uir-field-wrapper .container {margin-top:10px!important; padding-top:0px; padding-bottom:5px;margin-bottom: -5px!important;}')
							ns_response += ('.row{padding: 0px;height: 100px; min-width:1464.80px; display: flex;}')
							ns_response += ('.st-box {text-decoration:none;margin-left: 20px;')
							ns_response += ('width:100%;')
							ns_response += ('height:70px;')
							ns_response += ('border-radius: 5px; margin:15px; padding:0px}.fixed-size-div {width: 33%;height: 80px;margin:10px;border-radius: 5px;}')
							ns_response += ('</style></head> ')
							ns_response += ('<body>')
							ns_response += ('<div class="container">')
							ns_response += ('<div class ="row" class="column">')


							var total_Success = search.load({ id: searchObject.Success, })
							log.debug('total_Success Obj', JSON.stringify(total_Success))
							log.debug('total_Success', total_Success.Type)
							var type = total_Success.searchType;
							log.debug('type', type)
							var filter_Success = total_Success.filters
							log.debug('filter_Success', filter_Success)
							var names = "";
							for (var index = filter_Success.length - 1; index < filter_Success.length; index++) {
								names = filter_Success[index].name;
							}
							log.debug('names', names)
							var Success_record = '';
							if (type in record_type) {
								var Success_record = url_header + type + record_type[type][0] + Start_Date + record_type[type][1] + End_Date + record_type[type][2] + searchObject.Success;
								log.debug('Success_record', Success_record)
							}


							if (Start_Date && End_Date) {
								var customFilters = search.createFilter({
									name: names,
									operator: search.Operator.WITHIN,
									values: [`${Start_Date}`, `${End_Date}`]
								});
								log.debug('customFilters', customFilters)
								filter_Success.pop()
								total_Success.filters.push(customFilters);
							}
							var TotalItemSuccess = total_Success.runPaged().count;


							var Failed = search.load({ id: searchObject.Failed, })
							var Custom_record = Failed.searchType;
							var filter_Failed = Failed.filters
							log.debug('Custom_record', Custom_record)

							if (type == 'item') {
								type = 'product'
							}
							if (type == 'salesorder') {
								type = 'sales%20order'
							}
							if (type == 'noninventoryitem') {
								type = 'item'
							}

							var Failed_record = "";
							if (Custom_record in record_type) {
								Failed_record = "https://" + host + record_type[Custom_record][0] + Custom_record + record_type[Custom_record][1] + Start_Date + record_type[Custom_record][2] + End_Date + record_type[Custom_record][3] + type + record_type[Custom_record][4] + Source + record_type[Custom_record][5] + searchObject.Failed;
								log.debug('Failed_record', Failed_record)
							} else {
								Failed_record = url_header + Custom_record + record_type[Custom_record][0] + Start_Date + record_type[Custom_record][1] + End_Date + record_type[Custom_record][2] + searchObject.Success;
							}

							var criteria_date = "";
							for (var index1 = filter_Failed.length - 1; index1 < filter_Failed.length; index1++) {
								criteria_date = filter_Failed[index1].name;
							}
							log.debug('criteria_date', criteria_date)

							if (Start_Date && End_Date) {
								var customFilters = search.createFilter({
									name: criteria_date,
									operator: search.Operator.WITHIN,
									values: [`${Start_Date}`, `${End_Date}`]
								}
								);
								filter_Failed.pop()
								Failed.filters.push(customFilters);
								if (type == 'sales%20order') {
									type = 'Sales Order';
								}
								log.debug('type11', type)
								var customFilters = search.createFilter({
									name: "custrecord_streams_record_type",
									operator: "is",
									values: [type]
								});
								log.debug('customFilters11', customFilters)
								// filter_Failed.pop()
								Failed.filters.push(customFilters);
							}
							var Total_Failed = Failed.runPaged().count;
							var TotalItemCount = TotalItemSuccess + Total_Failed;

							ns_response += ('<div class="fixed-size-div" style="background-color:#ffa500;" ><a id="st-box" class="st-box">')
							ns_response += ('<h1 class="heads" style="color:white;text-align:left;margin-bottom: -20px;margin-top: -13px;font-size: 40px;margin-left: 20px;">' + TotalItemCount + '</h1>')
							ns_response += ('<p style="color:white; text-align:left;font-size: 15px;margin-left: 20px;"><b>Total Record</b></p>')
							ns_response += ('</a></div>')
							ns_response += ('<div class="fixed-size-div" style="background-color: #00b300;"><a href="' + Success_record + '" target="_blank" id="st-box" class="st-box" >')
							ns_response += ('<h1 class="heads" style="color:black;text-align:left;margin-bottom: -20px;margin-top: -13px;font-size: 40px;margin-left: 20px;">' + TotalItemSuccess + '</h1>')
							ns_response += ('<p style="color:black; text-align:left;font-size: 15px;margin-left: 20px;"><b>Success Record</b></p>')
							ns_response += ('</a></div>')
							ns_response += ('<div class="fixed-size-div" style="background-color: #ff1a1a;"><a href="' + Failed_record + '" target="_blank" id="st-box" class="st-box" >')
							ns_response += ('<h1 class="heads" style="color:white;text-align:left;margin-bottom: -20px;margin-top: -13px;font-size: 40px;margin-left: 20px;">' + Total_Failed + '</h1>')
							ns_response += ('<p style="color:white; text-align:left;font-size: 15px;margin-left: 20px;"><b>Failed Record</b></p>')
							ns_response += ('</a></div>')
							ns_response += ('</div>')
							ns_response += ('</div>')
							//   ns_response += ('</center>') 
							ns_response += ('</body>')
							ns_response += ('</html>')

							var itemgroup = form.addFieldGroup({
								id: 'itemgroup' + i,
								label: searchObject.Name + '(' + Source + ' to ' + Destination + ')'
							});

							form.addField({
								id: 'custpage_sfnsitem' + i,
								type: serverWidget.FieldType.INLINEHTML,
								label: 'Dashboard Content',
								container: 'itemgroup' + i
							}).defaultValue = ns_response;

						}
					} catch (error) {
						log.error('Error', error)
					}
				}

				context.response.writePage(form);
			}
		} catch (e) {
			log.error('error', e)
		}
	}

	return {
		onRequest: onRequest,
	};
});
