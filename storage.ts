import { Storage } from "@plasmohq/storage"

const storage = new Storage({
  area: 'local'
})


const BLACKLIST_KEY: string = "blacklist";
storage.watch({
  [BLACKLIST_KEY]: (newValue, oldValue) => {
    console.log("Blacklist updated:", newValue);
  }
});

export default storage
