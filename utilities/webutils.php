<?php

// Post a CURL to a URL. Assumes JSON if it's a post
// If data_arr is not null, assumes it's a json string
// If the tierion_header is not null, it will add that list to the sent headers
function do_curl($url, $data_arr=NULL, $tierionHeaderArray=[])
{
	$ch = curl_init($url);

	$headers = $tierionHeaderArray;
	// curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C)');
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);

	if ($data_arr != NULL) {
		$headers = array_merge(array('Content-Type: application/json'), $headers);
		$data_string = json_encode($data_arr);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
	}
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

	ob_start(); // prevent any output
	return curl_exec($ch); // Execute the Curl Command
	ob_end_clean(); // stop preventing output
	curl_close($ch);
}
