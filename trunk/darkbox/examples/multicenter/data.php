<?php
	$names = array('Alaska Affiliate', 'This is a really really long name, so long that it is unfathomable Dept','Alabama Affiliate','Arkansas Affiliate','American Samoa Affiliate','Arizona Affiliate','California Affiliate','Colorado Affiliate','Connecticut Affiliate','District of Columbia Affiliate','Washington, Dc Affiliate','Delaware Affiliate','Florida Affiliate','Federated States of Micronesia Affiliate','Georgia Affiliate','Guam Affiliate','Hawaii Affiliate','Iowa Affiliate','Idaho Affiliate','Illinois Affiliate','Indiana Affiliate','Kansas Affiliate','Kentucky Affiliate','Louisiana Affiliate','Massachusetts Affiliate','Maryland Affiliate','Maine Affiliate','Marshall Islands Affiliate','Michigan Affiliate','Minnesota Affiliate','Missouri Affiliate','Northern Mariana Islands Affiliate','Mississippi Affiliate','Montana Affiliate','North Carolina Affiliate','North Dakota Affiliate','Nebraska Affiliate','New Hampshire Affiliate','New Jersey Affiliate','New Mexico Affiliate','Nevada Affiliate','New York Affiliate','Ohio Affiliate','Oklahoma Affiliate','Oregon Affiliate','Pennsylvania Affiliate','Puerto Rico Affiliate','Palau Affiliate','Rhode Island Affiliate','South Carolina Affiliate','South Dakota Affiliate','Tennessee Affiliate','Texas Affiliate','Utah Affiliate','Virginia Affiliate','Virgin Islands Affiliate','Vermont Affiliate','Washington Affiliate','Wisconsin Affiliate','West VirginiA Affiliate','Wyoming Affiliate','AK State','AL State','AR State','AS State','AZ State','CA State','CO State','CT State','DC State','DE State','FL State','FM State','GA State','GU State','HI State','IA State','ID State','IL State','IN State','KS State','KY State','LA State','MA State','MD State','ME State','MH State','MI State','MN State','MO State','MP State','MS State','MT State','NC State','ND State','NE State','NH State','NJ State','NM State','NV State','NY State','OH State','OK State','OR State','PA State','PR State','PW State','RI State','SC State','SD State','TN State','TX State','UT State','VA State','VI State','VT State','WA State','WI State','WV State','WY State');
	$json = '{"multicenter": { create_url: "create_me.php", centers: [';
	$json .= '{"id": "all_centers", "name": "All Centers", "type": "all", "contacts": 1235204, "admins": 4, "contacts_valid": 98001, "contacts_active": 87531, "date_created": 20050711, "switch_url": "blah.html"}';
	
	// $max = getrandmax();
	$max = 1000000;
	
	foreach($names as $name) {
		$id = str_replace(' ', '_', strtolower($name));
		$contacts = rand(15, $max);
		$valid = rand(0, $contacts);
		$active = rand(0, $valid);
		
		$str = ',{"id": "' . $id . '", "name": "' . $name . '", "type": "center", "contacts": ' . $contacts . ', "admins": '. $valid . ', "contacts_valid": ' . $valid . ', "contacts_active": ' . $active . ', "date_created": 20051013, "switch_url": "' . $id . '.html"}';
		$json .= $str;
	}
		
	$json .= ']}}';
	echo $json;
?>
