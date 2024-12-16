![Icon](assets/icon.png)

# repo-glance

A tiny chrome extension that shows github repository metadata as a popup on repo link hover

![Screenshot](assets/screenshot_2.png)

### How to install

Chrome / Edge

- Download the latest [release](https://github.com/navxio/repo-glance/releases) and unzip
- go to chrome://extensions, turn on developer mode
- Load unpacked and navigate to the unzipped folder

Firefox

- Download the latest [release](https://github.com/navxio/repo-glance/releases) zip
- go to about:addons and select Debug addons from settings icon
- Click 'Load Temporary Add-on' and open the downloaded zip

#### Development

Based on the [plasmo](https://docs.plasmo.com) framework

#### TODO

- [x] (Perf) Move to gh graphql api
- [x] delegate extra work to service workers
- [x] Firefox support
- [ ] Font size range picker

Tested on Edge 131.0, chrome 131.10, firefox 133.0 on mac

### Contributing

PRs are welcome :)
