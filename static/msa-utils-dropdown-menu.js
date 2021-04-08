import { importHtml } from "/msa/utils/msa-utils.js"

importHtml(`<style>
	msa-utils-dropdown-menu ul {
		position: relative;
		line-height: 0;
		background-color: white;
		padding: 0;
		margin: 0;
		box-shadow: 1pt 1pt 2pt 1pt #aaa;
		display: inline-block;
		white-space: nowrap;
	}
	msa-utils-dropdown-menu li {
		display: inline-block;
		cursor: pointer;
	}
	msa-utils-dropdown-menu ul li ul {
		position: absolute;
		top: 41px;
		left: 0;
		display: none;
		min-width: 100%;
	}
	msa-utils-dropdown-menu ul li:hover > ul {
		display: inline-block;
	}
	msa-utils-dropdown-menu li > *:first-child {
		padding: 5px;
		margin: 3px;
		outline: 0;
		width: 24px;
		height: 24px;
	}
	msa-utils-dropdown-menu li:hover > *:first-child {
		box-shadow: 1pt 1pt 3pt 1pt #aaa;
		border-radius: 3pt;
		background: #eee;
	}
</style>`)
