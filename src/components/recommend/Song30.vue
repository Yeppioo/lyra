<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="content-overlay">
    <div class="big" v-if="!uiProperties.personalized.song30.loading">
      <div class="big-img-c">
        <img
          class="big-img"
          :src="
            uiProperties.personalized.song30.songs[uiProperties.personalized.song30.selectedindex]
              ?.pic
          "
          alt="song pic" />
      </div>
      <div class="right-box">
        <div class="info-box">
          <span class="song-name">
            {{
              uiProperties.personalized.song30.songs[uiProperties.personalized.song30.selectedindex]
                ?.name
            }}</span
          >
          <span class="song-artists">
            {{
              uiProperties.personalized.song30.songs[
                uiProperties.personalized.song30.selectedindex
              ]?.artist.join(',')
            }}</span
          >
        </div>
        <div class="control-box">
          <i class="play-button-container">
            <button @click="play" type="button" class="play-button control-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                height="100%"
                viewBox="128 61 829 902"
                width="100%">
                <path
                  d="M224.5,963C211.167,963 198.667,960.5 187,955.5C175.333,950.5 165.083,943.667 156.25,935C147.417,926.333 140.5,916.167 135.5,904.5C130.5,892.833 128,880.333 128,867L128,157C128,143.667 130.5,131.167 135.5,119.5C140.5,107.833 147.333,97.6667 156,89C164.667,80.3334 174.833,73.5001 186.5,68.5C198.167,63.5001 210.667,61.0001 224,61C232,61.0001 240,62.0001 248,64C256,66.0001 263.5,69.0001 270.5,73L907.5,428C922.833,436.667 934.833,448.417 943.5,463.25C952.167,478.083 956.5,494.333 956.5,512C956.5,530 952.25,546.333 943.75,561C935.25,575.667 923.167,587.333 907.5,596L271,951C264,955 256.5,958 248.5,960C240.5,962 232.5,963 224.5,963Z"
                  fill="#4C6173"
                  fill-opacity="1"></path>
              </svg>
            </button>
          </i>
          <a-button @click="next" class="t-button control-button" type="text">
            <font-awesome-icon size="lg" :icon="['fas', 'forward-step']" />
          </a-button>
          <a-button @click="dislike" class="t-button control-button" type="text">
            <font-awesome-icon size="lg" :icon="['fas', 'thumbs-down']" />
          </a-button>
        </div>
      </div>
    </div>
    <div class="small" v-if="!uiProperties.personalized.song30.loading">
      <div class="top">
        <div class="small-img-c">
          <img
            class="small-img"
            :src="
              uiProperties.personalized.song30.songs[uiProperties.personalized.song30.selectedindex]
                ?.pic
            "
            alt="song pic" />
        </div>
        <div class="info-box">
          <span class="song-name">
            {{
              uiProperties.personalized.song30.songs[uiProperties.personalized.song30.selectedindex]
                ?.name
            }}</span
          >
          <span class="song-artists">
            {{
              uiProperties.personalized.song30.songs[
                uiProperties.personalized.song30.selectedindex
              ]?.artist.join(',')
            }}</span
          >
        </div>
      </div>
      <div class="bottom">
        <div class="control-box">
          <i class="play-button-container">
            <button @click="play" type="button" class="play-button control-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                height="100%"
                viewBox="128 61 829 902"
                width="100%">
                <path
                  d="M224.5,963C211.167,963 198.667,960.5 187,955.5C175.333,950.5 165.083,943.667 156.25,935C147.417,926.333 140.5,916.167 135.5,904.5C130.5,892.833 128,880.333 128,867L128,157C128,143.667 130.5,131.167 135.5,119.5C140.5,107.833 147.333,97.6667 156,89C164.667,80.3334 174.833,73.5001 186.5,68.5C198.167,63.5001 210.667,61.0001 224,61C232,61.0001 240,62.0001 248,64C256,66.0001 263.5,69.0001 270.5,73L907.5,428C922.833,436.667 934.833,448.417 943.5,463.25C952.167,478.083 956.5,494.333 956.5,512C956.5,530 952.25,546.333 943.75,561C935.25,575.667 923.167,587.333 907.5,596L271,951C264,955 256.5,958 248.5,960C240.5,962 232.5,963 224.5,963Z"
                  fill="#4C6173"
                  fill-opacity="1"></path>
              </svg>
            </button>
          </i>
          <a-button @click="next" class="t-button control-button" type="text">
            <font-awesome-icon size="lg" :icon="['fas', 'forward-step']" />
          </a-button>
          <a-button @click="dislike" class="t-button control-button" type="text">
            <font-awesome-icon size="lg" :icon="['fas', 'thumbs-down']" />
          </a-button>
        </div>
      </div>
    </div>
    <div class="loading" v-if="uiProperties.personalized.song30.loading">
      <a-skeleton active avatar :paragraph="{ rows: 3 }" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { usePlayerStore, setCurrentSong } from '@/stores/player';
import { useUIPropertiesStore } from '../../stores/uiProperties';
import { storeToRefs } from 'pinia';
const uiPropertiesStore = useUIPropertiesStore();
const { uiProperties } = storeToRefs(uiPropertiesStore);
import { functions as getSongApi } from '@/api/netease/getSong';
import { message } from 'ant-design-vue';

const dislike = () => {
  console.log('dislike');
};
const next = () => {
  uiProperties.value.personalized.song30.selectedindex++;
  if (
    uiProperties.value.personalized.song30.selectedindex >=
    uiProperties.value.personalized.song30.songs.length
  )
    uiProperties.value.personalized.song30.selectedindex = 0;
};
const play = async () => {
  const song =
    uiProperties.value.personalized.song30.songs[
      uiProperties.value.personalized.song30.selectedindex
    ];
  try {
    const urlRes = await getSongApi.getSongUrl(song.id);
    console.log('urlRes', urlRes);

    const url = urlRes.data?.[0]?.url;
    if (!url) {
      message.error('无法获取播放地址');
      return;
    }

    setCurrentSong(
      {
        id: song.id,
        duration: urlRes.data[0].time,
        name: song.name,
        artist: song.artist.join(','),
        cover: song.pic,
      },
      usePlayerStore()
    );
  } catch {
    message.error('播放失败');
  }
};
</script>
<style lang="css" scoped>
.loading {
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  position: absolute;
  margin: 20px;
}
.tip span {
  font-family: var(--y-font);
  font-size: 16px;
}
.big,
.small {
  width: 100%;
  height: 100%;
  position: absolute;
}
.top {
  display: flex;
  margin-top: 20px;
}
.tip {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  width: 100%;
  height: 100%;
}
.big-img-c {
  width: 160px;
  height: 160px;
  margin-left: 20px;
  user-select: none;
}
.small-img-c {
  width: 96px;
  height: 96px;
  margin-left: 20px;
  user-select: none;
}
.small {
  display: none;
  flex-direction: column;
}
.content-overlay {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.big-img {
  width: 160px;
  height: 160px;
  border-radius: 8px;

  box-shadow: 0 0 24px 5px rgba(0, 0, 0, 5%);
}
.small-img {
  width: 96px;
  height: 96px;
  border-radius: 8px;

  box-shadow: 0 0 24px 5px rgba(0, 0, 0, 5%);
}
.song-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  font-size: 26px;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  line-clamp: 2;
  word-break: break-all;
  overflow: hidden;
  font-family: var(--y-font);
  line-height: 1.35;
}
.info-box {
  margin-left: 20px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
}
.right-box {
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.song-artists {
  font-size: 15px;
  font-family: var(--y-font);
  display: -webkit-box;
  word-wrap: break-word;
  text-wrap: auto;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  text-overflow: ellipsis;
  overflow: hidden;
}
.play-button-container {
  width: 42px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}
.play-button {
  width: 38px;
  height: 38px;
}
.play-button:hover {
  transform: scale(1.1);
}

.big {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.control-box {
  background: transparent;
  border: 0;
  height: 38px;
  display: flex;
  margin-left: 20px;
  flex-direction: row;
  margin-bottom: 5px;
  align-items: center;
}
.play-button svg {
  width: 13px;
  position: relative;
  left: 1px;
  color: #4c6173;
}
.t-button {
  padding: 0 7px;
  margin-right: 2px;
  width: 38px;
  height: 38px;
  border: 0;
  margin: 0;
}
.t-button svg {
  color: #fff;
}
.control-button {
  border: 0;
  cursor: pointer;
  margin-right: 8px;
}
.small .control-box {
  margin-left: 25px;
  margin-top: 23px;
}
.play-button {
  background: #fff;
  border-radius: 50%;
  padding: 0;
  margin: 0;
  border: 0;
}
@media (max-width: 1075px) {
  .small {
    display: flex;
  }
  .big {
    display: none;
  }
}
@media (max-width: 767px) {
  .small {
    display: none;
  }
  .big {
    display: flex;
  }
}
@media (max-width: 550px) {
  .small {
    display: flex;
  }
  .big {
    display: none;
  }
}
</style>
