import { apiSettings } from '../config';

const { neteaseApiBase: apiBase, realIP } = apiSettings;
const realIpParam = realIP ? `realIP=${realIP}` : '';

export interface CommentUser {
  locationInfo: null;
  liveInfo: null;
  anonym: number;
  highlight: boolean;
  avatarDetail: null;
  userType: number;
  avatarUrl: string;
  followed: boolean;
  mutual: boolean;
  remarkName: null;
  socialUserId: null;
  vipRights: {
    associator: {
      vipCode: number;
      rights: boolean;
      iconUrl: string;
    } | null;
    musicPackage: {
      vipCode: number;
      rights: boolean;
      iconUrl: string;
    } | null;
    redplus: {
      vipCode: number;
      rights: boolean;
      iconUrl: string;
    } | null;
    redVipAnnualCount: number;
    redVipLevel: number;
    relationType: number;
    memberLogo: null;
    extInfo: null;
  } | null;
  nickname: string;
  authStatus: number;
  expertTags: string[] | null;
  experts: null;
  vipType: number;
  commonIdentity: null;
  userId: number;
  target: null;
}

export interface HotComment {
  user: CommentUser;
  beReplied: [];
  pendantData: {
    id: number;
    imageUrl: string;
  } | null;
  showFloorComment: null;
  status: number;
  commentId: number;
  content: string;
  richContent: null;
  contentResource: null;
  time: number;
  timeStr: string;
  needDisplayTime: boolean;
  likedCount: number;
  expressionUrl: null;
  commentLocationType: number;
  parentCommentId: number;
  decoration: null;
  repliedMark: null;
  grade: null;
  userBizLevels: null;
  ipLocation: {
    ip: null;
    location: string;
    userId: null;
  };
  owner: boolean;
  medal: null;
  likeAnimationMap: null;
  liked: boolean;
}

export interface HotCommentsResponse {
  topComments: [];
  hasMore: boolean;
  hotComments: HotComment[];
  total: number;
  code: number;
}

/**
 * 获取热门评论
 * @param id 资源 id
 * @param type 资源类型 (0: 歌曲, 1: mv, 2: 歌单, 3: 专辑, 4: 电台节目, 5: 视频, 6: 动态, 7: 电台)
 * @param limit 取出评论数量, 默认为 20
 * @param offset 偏移数量, 用于分页
 * @param before 分页参数, 取上一页最后一项的 time 获取下一页数据
 */
export async function getHotComments(
  id: string,
  type: number,
  limit: number = 20,
  offset: number = 0,
  before?: number
): Promise<HotCommentsResponse> {
  let url = `${apiBase}/comment/hot?id=${id}&type=${type}&limit=${limit}&offset=${offset}&${realIpParam}`;
  if (before) {
    url += `&before=${before}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.code !== undefined && data.hotComments !== undefined) {
      return data as HotCommentsResponse;
    }
    throw new Error('Invalid response format from hot comments API');
  } catch (error) {
    console.error('Error fetching hot comments:', error);
    throw error;
  }
}

export const functions = {
  getHotComments,
};
