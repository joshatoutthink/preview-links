<?php 
/**
 * Plugin Name: Wp Preview Links
 * Plugin Author: Josh Kennedy
 * Plugin Description: When User hovers over links will add a preview of the page that the link links to.
 */
define('PL_DIR', plugin_dir_path(__FILE__));
define('PL_URL', plugin_dir_url(__FILE__);
add_action(
	'wp_enqueue_scripts',
	
	function(){
		wp_enqueue_style(
			'preview-links-style',
			PL_URL . 'pl-styles.css', [], '1.0.0', 'screen'
		);

	}
)
add_action('wp_head', function(){
?>
<script type="module">
		import {PreviewLinks} from "<?php echo PL_URL . 'prod.preview-links.js'; ?>";
		const pl = new PreviewLinks({
			//TODO
		});
		addEventListener('DOMContentLoaded',pl.init);
	</script>
<?php
}
