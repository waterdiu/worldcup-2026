import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../App';
import { bracket, finalsMatchResults, groups, tournamentMeta } from '../data';
import { buildOAuthRedirectUrl } from '../hooks/useAuth';
import { contentByLocale } from '../i18n/content';

describe('App routes', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('uses the GitHub Pages base path for internal navigation links', () => {
    vi.stubEnv('BASE_URL', '/worldcup-2026/');

    try {
      // Use a route that renders the global PageNav (the /stats page intentionally hides it).
      window.history.replaceState({}, '', '/worldcup-2026/');
      render(<App />);

      expect(screen.getByRole('link', { name: '首页' })).toHaveAttribute('href', '/worldcup-2026/');
      expect(screen.getByRole('link', { name: '预选赛' })).toHaveAttribute('href', '/worldcup-2026/qualifiers');
      expect(screen.getByRole('link', { name: '统计' })).toHaveAttribute('href', '/worldcup-2026/stats');
      expect(screen.getByRole('link', { name: '我的' })).toHaveAttribute('href', '/worldcup-2026/me');
    } finally {
      cleanup();
      vi.unstubAllEnvs();
    }
  });

  it('builds OAuth redirect URLs with the GitHub Pages base path', () => {
    vi.stubEnv('BASE_URL', '/worldcup-2026/');

    try {
      window.history.replaceState({}, '', '/worldcup-2026/me');
      expect(buildOAuthRedirectUrl()).toBe('http://localhost:3000/worldcup-2026/me');

      window.history.replaceState({}, '', '/me');
      expect(buildOAuthRedirectUrl()).toBe('http://localhost:3000/worldcup-2026/me');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('renders the signed-out user center with Google login', () => {
    window.history.replaceState({}, '', '/me');
    render(<App />);

    expect(screen.getByRole('heading', { name: /我的世界杯/i })).toBeInTheDocument();
    expect(screen.getByText(/登录后可以同步收藏和预测/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /使用 Google 登录/i })).toBeInTheDocument();
    expect(screen.getByText(/收藏感兴趣的比赛/i)).toBeInTheDocument();
    expect(screen.getByText(/预测比赛胜负与比分/i)).toBeInTheDocument();
  });

  it('shows a match favorite action on match detail pages', () => {
    window.history.replaceState({}, '', '/matches/7');
    render(<App />);

    expect(screen.getByRole('button', { name: /登录后收藏比赛/i })).toBeInTheDocument();
  });

  it('shows favorite and prediction actions on the opening match detail page', () => {
    window.history.replaceState({}, '', '/matches/1');
    render(<App />);

    expect(screen.getByRole('button', { name: /登录后收藏比赛/i })).toBeInTheDocument();
    expect(screen.getByText(/登录后可以预测胜负和比分/i)).toBeInTheDocument();
    expect(screen.getByText(/比赛时间 \/ 天气/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /用户操作/i })).not.toBeInTheDocument();
  });

  it('shows a signed-out prediction prompt on match detail pages', () => {
    window.history.replaceState({}, '', '/matches/7');
    render(<App />);

    expect(screen.getByText(/我的预测/i)).toBeInTheDocument();
    expect(screen.getByText(/登录后可以预测胜负和比分/i)).toBeInTheDocument();
  });

  it('renders the chinese homepage at the root route with unprefixed navigation links', () => {
    window.history.replaceState({}, '', '/');
    render(<App />);

    expect(screen.getByRole('img', { name: /2026 世界杯宣传海报/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '12 个小组详情' })).toHaveAttribute(
      'href',
      '/groups'
    );
    expect(screen.getByRole('link', { name: '48 支球队详情' })).toHaveAttribute(
      'href',
      '/teams'
    );
    expect(screen.getByRole('link', { name: '104 场赛程详情' })).toHaveAttribute(
      'href',
      '/matches'
    );
    expect(screen.getByRole('link', { name: '16 个城市详情' })).toHaveAttribute(
      'href',
      '/cities'
    );
  });

  it('renders the english homepage at the /en route with prefixed navigation links', () => {
    window.history.replaceState({}, '', '/en');
    render(<App />);

    expect(screen.getByRole('img', { name: /World Cup 2026 poster/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '12 groups details' })).toHaveAttribute(
      'href',
      '/en/groups'
    );
    expect(screen.getByRole('link', { name: '48 teams details' })).toHaveAttribute(
      'href',
      '/en/teams'
    );
    expect(screen.getByRole('link', { name: '104 matches details' })).toHaveAttribute(
      'href',
      '/en/matches'
    );
    expect(screen.getByRole('link', { name: '16 host cities details' })).toHaveAttribute(
      'href',
      '/en/cities'
    );
  });

  it('keeps the old /zh route as a chinese compatibility alias', () => {
    window.history.replaceState({}, '', '/zh');
    render(<App />);

    expect(screen.getByRole('img', { name: /2026 世界杯宣传海报/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '12 个小组详情' })).toHaveAttribute(
      'href',
      '/groups'
    );
    expect(screen.getByRole('link', { name: '48 支球队详情' })).toHaveAttribute(
      'href',
      '/teams'
    );
  });

  it('renders the homepage media carousel with promo poster and opening match slide', () => {
    render(<App />);

    expect(screen.getByRole('img', { name: /2026 世界杯宣传海报/i })).toHaveAttribute(
      'src',
      '/worldcup-assets/optimized/home-promo-hero-wide.webp'
    );
    expect(screen.getByRole('img', { name: /揭幕战海报/i })).toHaveAttribute(
      'src',
      '/worldcup-assets/optimized/opening-match-poster-wide.jpg'
    );
    expect(screen.getByLabelText(/播放世界杯宣传视频/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/进入揭幕战详细页/i)).toHaveAttribute('href', '/matches/1');
    expect(screen.queryByLabelText(/官方宣传片播放器/i)).not.toBeInTheDocument();
  });

  it('renders dense metric cards on the homepage', () => {
    render(<App />);

    expect(screen.getAllByText(/A 组/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/L 组/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: '小组' })).toHaveAttribute('href', '/groups');
    expect(screen.getByRole('link', { name: '赛程' })).toHaveAttribute('href', '/matches');
    expect(screen.getByText(/所选日期赛程/i)).toBeInTheDocument();
    expect(screen.getAllByText(/待定/).length).toBeGreaterThan(1);
    expect(screen.getByLabelText(/进入球队详情: Mexico/)).toHaveAttribute('data-team-name', '墨西哥');
    expect(screen.getAllByText(/球队/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/美国/).length).toBeGreaterThan(5);
    expect(screen.getAllByLabelText(/进入球队详情:/).length).toBe(48);
    expect(screen.getAllByRole('link', { name: /A 组/i })[0]).toHaveAttribute('href', '/groups/A');
  });

  it('renders team chips without native title tooltips', () => {
    render(<App />);

    const scotlandChip = screen.getByLabelText(/进入球队详情: Scotland/);
    expect(scotlandChip).toHaveAttribute('data-team-name', '苏格兰');
    expect(scotlandChip).not.toHaveAttribute('title');
    expect(screen.getByLabelText(/进入球队详情: Morocco/)).toHaveTextContent('摩洛哥');
  });

  it('renders the qualifiers overview page', () => {
    window.history.replaceState({}, '', '/qualifiers');
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /^世界杯预选赛$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/球队总数/i)).toBeInTheDocument();
    expect(screen.getByText(/出线球队数/i)).toBeInTheDocument();
    expect(screen.getByText(/比赛场数/i)).toBeInTheDocument();
    expect(screen.getByText(/进球总数/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /世界杯预选赛洲际地图/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /亚洲/i })).toHaveAttribute('href', '/qualifiers/afc');
    expect(screen.getByText(/数据缺失统计/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /打开预选赛详情:/i })).not.toBeInTheDocument();
  });

  it('filters confederation matches by qualified team', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/qualifiers/uefa');
    render(<App />);

    expect(screen.getByRole('heading', { name: /欧足联预选赛/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /返回预选赛总览/i })).toHaveAttribute('href', '/qualifiers');

    await user.click(screen.getByRole('button', { name: /挪威/i }));

    expect(screen.getByRole('link', { name: /打开预选赛详情: Italy 对 .*挪威/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /打开预选赛详情: .*阿联酋 对 .*伊拉克/i })
    ).not.toBeInTheDocument();
  });

  it('renders a qualifier match detail page with stats, events, lineups, ratings, and missing data', () => {
    window.history.replaceState({}, '', '/qualifiers/matches/afc-uae-iraq-2025-11-13');
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /阿联酋.*1-1.*伊拉克/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /比赛统计/i })).toBeInTheDocument();
    expect(screen.getByText(/控球率/i)).toBeInTheDocument();
    expect(screen.getByText(/48%/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /阵容/i })).toBeInTheDocument();
    expect(screen.getByText(/Khalid Eisa/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ali Al-Hamadi/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/进球、红黄牌和换人/i)).toBeInTheDocument();
    expect(screen.getByText(/18' · 进球/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /球员赛后评分/i })).toBeInTheDocument();
    expect(screen.getByText(/暂无球员评分数据/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /缺失数据/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /数据覆盖/i })).toBeInTheDocument();
    expect(screen.getByText(/来源：FIFA match centre \/ public result feeds/i)).toBeInTheDocument();
  });

  it('does not render the removed finals page', () => {
    window.history.replaceState({}, '', '/finals');
    render(<App />);

    expect(screen.queryByRole('heading', { name: /正赛中心/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '正赛' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /2026 世界杯宣传海报/i })).toBeInTheDocument();
  });

  it('renders the stats page from the primary navigation', () => {
    window.history.replaceState({}, '', '/stats');
    render(<App />);

    expect(screen.getByRole('link', { name: '统计' })).toHaveAttribute('href', '/stats');

    expect(screen.getByText(/WC 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/World Cup/i)).toBeInTheDocument();
    expect(screen.getAllByText('104').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2026 模拟/).length).toBeGreaterThan(0);

    expect(screen.getByRole('button', { name: '进球' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '阶段' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '时间' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '球队' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '射手' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '矩阵' })).toBeInTheDocument();
  });

  // The old experimental StatsPage derived metrics from a finals scaffold; it has been replaced by StatsPageV4 (Claude v4 template port).

  it('renders larger group tables on the groups page', () => {
    window.history.replaceState({}, '', '/groups');
    render(<App />);

    const groupALink = screen.getByRole('link', { name: /小组 A/ });

    expect(screen.getByRole('heading', { name: '分组详情' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '12 个小组' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /返回上一个页面/ })).toHaveAttribute('href', '/');
    expect(groupALink).toHaveAttribute('href', '/groups/A');
    expect(groupALink).toHaveClass('group-card__title-link');
    expect(screen.getAllByText('胜').length).toBeGreaterThan(1);
    expect(screen.getAllByText('平').length).toBeGreaterThan(1);
    expect(screen.getAllByText('负').length).toBeGreaterThan(1);
    expect(screen.getAllByText('进').length).toBeGreaterThan(1);
    expect(screen.getAllByText('失').length).toBeGreaterThan(1);
    expect(screen.getAllByText('分').length).toBeGreaterThan(1);
    expect(screen.getAllByText(/🇲🇽 墨西哥/).length).toBeGreaterThan(0);
  });

  it('renders every group-stage match on the group detail page', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/groups/A');
    render(<App />);

    const mexicoLink = screen.getByRole('link', { name: /🇲🇽 墨西哥/ });

    expect(screen.getByRole('heading', { name: /A 组比赛/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /返回上一个页面/ })).toHaveAttribute('href', '/groups');
    expect(mexicoLink).toHaveAttribute('href', '/teams/Mexico');
    expect(mexicoLink).toHaveClass('group-team-link');
    expect(screen.getAllByTestId('group-match-card')).toHaveLength(6);
    expect(screen.getByText(/🇲🇽 墨西哥 对 🇿🇦 南非/)).toBeInTheDocument();
    expect(screen.getByText(/🇲🇽 墨西哥 对 🇰🇷 韩国/)).toBeInTheDocument();
    expect(screen.getByText(/🇨🇿 捷克 对 🇿🇦 南非/)).toBeInTheDocument();
    expect(screen.queryByText(/主胜 52%/)).not.toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /展开比赛详情/ })[0]);

    expect(screen.getByText(/主胜 52%/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /比赛信息/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /赛前看点/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /小组影响/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /统计面板预留/ })).toBeInTheDocument();
    expect(screen.getByText(/首发阵容将在赛前公布/)).toBeInTheDocument();
    expect(screen.getByText(/控球率/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /事件时间线/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /收起比赛详情/ })).toBeInTheDocument();
  });

  it('renders a release-ready teams overview and team detail page', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/teams');
    render(<App />);

    expect(screen.getByRole('heading', { name: '球队总览' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /48 支参赛队/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/按小组查看全部参赛队/)).not.toBeInTheDocument();
    expect(screen.getAllByLabelText(/进入球队详情:/).length).toBe(48);
    expect(screen.getByRole('link', { name: /进入球队详情: Mexico/ })).toHaveClass('team-card__link');
    expect(screen.getByRole('link', { name: /进入球队详情: Mexico/ })).toHaveClass('team-card__name-link');
    expect(screen.getByRole('link', { name: /进入球队详情: Mexico/ })).toHaveClass('team-card');
    expect(screen.getByText(/世界排名第 15 位/)).toBeInTheDocument();
    expect(screen.queryByText(/查看详情/)).not.toBeInTheDocument();
    expect(screen.queryByText(/后续/)).not.toBeInTheDocument();
    expect(screen.queryByText(/当前页面/)).not.toBeInTheDocument();

    cleanup();
    window.history.replaceState({}, '', '/teams/Mexico');
    render(<App />);

    expect(screen.getAllByRole('heading', { name: /墨西哥/ }).length).toBeGreaterThan(0);
    expect(screen.getByTestId('team-detail-stack')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /球队基本信息/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/球队基本信息/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /球队基本介绍/ })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /历史战绩/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /预选赛与近期比赛/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /世界杯赛程/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /教练和球员介绍/ })).toBeInTheDocument();
    expect(screen.getAllByText(/A 组/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/东道主自动晋级/).length).toBeGreaterThan(0);
    expect(screen.getByText(/世界排名第 15 位/)).toBeInTheDocument();
    expect(screen.getByText(/世界杯参赛 18 次/)).toBeInTheDocument();
    expect(screen.getByText(/墨西哥共参加世界杯 18 次/)).toBeInTheDocument();
    expect(screen.getByText(/总战绩：60 场 17 胜 15 平 28 负，进 62 球失 101 球/)).toBeInTheDocument();
    expect(screen.getByText(/最佳成绩是 1970 年和 1986 年两次进入八强/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /墨西哥世界杯（1970）/ })).toBeInTheDocument();
    expect(screen.getAllByTestId('world-cup-history-toggle')).toHaveLength(17);
    expect(screen.queryByText(/墨西哥 4-0 萨尔瓦多/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /展开 1970 墨西哥世界杯/ }));

    expect(screen.getByText(/墨西哥 4-0 萨尔瓦多/)).toBeInTheDocument();
    expect(screen.getAllByTestId('world-cup-match-row')).toHaveLength(4);
    expect(screen.getByRole('heading', { name: /墨西哥世界杯（1986）/ })).toBeInTheDocument();
    expect(screen.queryByText(/墨西哥 0-0 西德（点球 1-4）/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /卡塔尔世界杯（2022）/ })).toBeInTheDocument();
    expect(screen.queryByText(/墨西哥 2-1 沙特阿拉伯/)).not.toBeInTheDocument();
    expect(screen.getByTestId('recent-results-card')).toBeInTheDocument();
    expect(screen.getAllByText(/东道主自动晋级/).length).toBeGreaterThan(0);
    expect(screen.getByText(/作为联合东道主，墨西哥没有参加中北美区预选赛/)).toBeInTheDocument();
    const recentRows = screen.getAllByTestId('recent-match-row');
    expect(recentRows).toHaveLength(4);
    expect(recentRows[0]).toHaveTextContent('2025 美金杯决赛');
    expect(recentRows[0]).toHaveTextContent('美国 1-2 墨西哥');
    expect(recentRows[3]).toHaveTextContent('2025 美金杯小组赛');
    expect(screen.getAllByText(/主教练/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Javier Aguirre/)).toBeInTheDocument();
    expect(screen.getByText(/最终名单确认前，国家队可以公布候选或训练名单/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /人员名单/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /核心球员观察/ })).not.toBeInTheDocument();
    expect(screen.getAllByTestId('team-person-row')).toHaveLength(7);
    expect(screen.getByText(/Santiago Gimenez/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Edson Alvarez/ })).toBeInTheDocument();
    expect(screen.getAllByText(/待确认/).length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('team-match-card')).toHaveLength(3);
    expect(screen.getByText(/🇲🇽 墨西哥 对 🇿🇦 南非/)).toBeInTheDocument();
    expect(screen.getByText(/🇲🇽 墨西哥 对 🇰🇷 韩国/)).toBeInTheDocument();
    expect(screen.getByText(/🇨🇿 捷克 对 🇲🇽 墨西哥/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /打开比赛详情: 墨西哥 对 南非/ })).toHaveAttribute('href', '/matches/1');
    expect(screen.getByRole('link', { name: /打开比赛详情: 捷克 对 墨西哥/ })).toHaveAttribute('href', '/matches/5');
    expect(screen.queryByText(/进入比赛详情/)).not.toBeInTheDocument();
    expect(screen.queryByText(/胜平负展示位/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/墨西哥城球场/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/后续/)).not.toBeInTheDocument();
    expect(screen.queryByText(/当前页面/)).not.toBeInTheDocument();
  });

  it('renders a release-ready matches overview with knockout route context', () => {
    window.history.replaceState({}, '', '/matches');
    const { container } = render(<App />);

    expect(container.querySelector('.world-cup-page--matches-overview')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '赛程总览' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /赛程中心/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/页面按赛事阶段/)).not.toBeInTheDocument();
    expect(screen.queryByText(/每场比赛一张紧凑卡片/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '小组赛' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '淘汰赛' })).toBeInTheDocument();
    expect(screen.queryByText(/左右两侧从 32 强开始/)).not.toBeInTheDocument();
    expect(screen.getAllByTestId('match-overview-group-card')).toHaveLength(72);
    expect(container.querySelector('[data-nearest-upcoming="true"]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /打开比赛详情: 捷克 对 墨西哥/ })).toHaveAttribute('href', '/matches/5');
    expect(screen.getByTestId('knockout-bracket-map')).toBeInTheDocument();
    expect(screen.getByTestId('knockout-left-path')).toBeInTheDocument();
    expect(screen.getByTestId('knockout-right-path')).toBeInTheDocument();
    expect(screen.getByTestId('knockout-final-path')).toBeInTheDocument();
    expect(screen.getAllByTestId('knockout-match-slot')).toHaveLength(32);
    expect(container.querySelectorAll('.knockout-match-slot__line--in').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.knockout-match-slot__line--out').length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/打开淘汰赛比赛详情:/)).toHaveLength(32);
    expect(screen.getByRole('link', { name: /打开淘汰赛比赛详情: 比赛 73/ })).toHaveAttribute('href', '/matches/73');
    expect(screen.getByRole('link', { name: /打开淘汰赛比赛详情: 比赛 104/ })).toHaveAttribute('href', '/matches/104');
    expect(screen.getAllByText(/2026年6月28日/).length).toBeGreaterThan(0);
    const match73Link = screen.getByRole('link', { name: /打开淘汰赛比赛详情: 比赛 73/ });
    expect(match73Link).toHaveTextContent(/比赛 73/);
    expect(match73Link).toHaveTextContent(/2026年6月28日/);
    expect(match73Link).toHaveTextContent(/小组 A 第二/);
    expect(match73Link).toHaveTextContent(/小组 B 第二/);
    expect(match73Link).not.toHaveTextContent(/洛杉矶球场/);
    expect(screen.queryByText(/后续/)).not.toBeInTheDocument();
    expect(screen.queryByText(/当前页面/)).not.toBeInTheDocument();
  });

  it('renders the homepage detail routes', () => {
    window.history.replaceState({}, '', '/matches/1');
    render(<App />);

    expect(screen.getByRole('heading', { name: /比赛信息/ })).toBeInTheDocument();
    expect(screen.getByTestId('match-info-card')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /🇲🇽 墨西哥/ })).toHaveAttribute('href', '/teams/Mexico');
    expect(screen.getByRole('link', { name: /🇿🇦 南非/ })).toHaveAttribute('href', '/teams/South%20Africa');
    expect(screen.getAllByText(/2026年6月11日 20:00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/墨西哥城球场/).length).toBeGreaterThan(0);
    expect(screen.getByText(/22°C/)).toBeInTheDocument();
    expect(screen.getByText(/主裁判/)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /预计首发阵容/ })).toBeInTheDocument();
    expect(screen.getByTestId('lineup-pitch')).toBeInTheDocument();
    expect(screen.getAllByTestId('lineup-player-marker')).toHaveLength(22);
    expect(screen.getByText(/4-3-3/)).toBeInTheDocument();
    expect(screen.getByText(/4-2-3-1/)).toBeInTheDocument();
    expect(screen.getAllByText(/Luis Malagon/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ronwen Williams/).length).toBeGreaterThan(0);

    expect(screen.getByRole('heading', { name: /预测分析/ })).toBeInTheDocument();
    expect(screen.getAllByText(/主胜 52%/).length).toBeGreaterThan(0);
    expect(screen.getByText(/预测比分/)).toBeInTheDocument();
    expect(screen.getByText(/2-1/)).toBeInTheDocument();
    expect(screen.getByText(/总进球 3 球/)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /赛后统计/ })).toBeInTheDocument();
    expect(screen.getByText(/控球率/)).toBeInTheDocument();
    expect(screen.getAllByText(/射门/).length).toBeGreaterThan(0);
    expect(screen.getByText(/传球成功率/)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /比赛过程记录/ })).toBeInTheDocument();
    expect(screen.getByText(/进球/)).toBeInTheDocument();
    expect(screen.getByText(/黄牌/)).toBeInTheDocument();
    expect(screen.getByText(/换人/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /比赛概览/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /球队信息与近期状态/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /关键球员对位/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/首发阵容将在赛前公布/)).not.toBeInTheDocument();
    expect(screen.queryByText(/预留/)).not.toBeInTheDocument();
    expect(screen.queryByText(/后续/)).not.toBeInTheDocument();
    expect(screen.queryByText(/当前页面/)).not.toBeInTheDocument();
  });

  it('renders generated group-stage match detail routes from team fixture cards', () => {
    window.history.replaceState({}, '', '/matches/5');
    render(<App />);

    expect(screen.getByRole('heading', { name: /比赛详情/ })).toBeInTheDocument();
    expect(screen.getByText(/🇨🇿 捷克 对 🇲🇽 墨西哥/)).toBeInTheDocument();
    expect(screen.getAllByText(/A 组/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/第 3 轮/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/后续/)).not.toBeInTheDocument();
    expect(screen.queryByText(/当前页面/)).not.toBeInTheDocument();
  });

  it('renders knockout match detail routes from the bracket map', () => {
    window.history.replaceState({}, '', '/matches/104');
    render(<App />);

    expect(screen.getByRole('heading', { name: /淘汰赛比赛详情/ })).toBeInTheDocument();
    expect(screen.getByText(/比赛 104/)).toBeInTheDocument();
    expect(screen.getByText(/胜者：比赛 101 对 胜者：比赛 102/)).toBeInTheDocument();
    expect(screen.getAllByText(/纽约新泽西球场/).length).toBeGreaterThan(0);
    expect(screen.getByText(/阶段：决赛/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /比赛摘要/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /事件时间线/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /技术统计/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /阵容与人员/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /淘汰赛影响/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /相关比赛/ })).toBeInTheDocument();
    expect(screen.getByText(/冠军归属将在这场比赛后确认/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /返回淘汰赛图/ })).toHaveAttribute('href', '/matches#knockout');
    expect(screen.queryByText(/胜平负展示/)).not.toBeInTheDocument();
    expect(screen.queryByText(/后续/)).not.toBeInTheDocument();
    expect(screen.queryByText(/当前页面/)).not.toBeInTheDocument();
  });

  it('renders the cities page with centered host-country maps and side posters', () => {
    window.history.replaceState({}, '', '/cities');
    render(<App />);

    expect(screen.getByRole('img', { name: /2026 世界杯主办城市地图/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/地图标点:/).length).toBe(16);
    expect(screen.getAllByLabelText(/进入城市详情:/).length).toBe(16);
    expect(screen.getAllByRole('img', { name: /宣传海报$/ }).length).toBe(16);
    expect(screen.getAllByText('墨西哥城').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /打开布局编辑器/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /16 个主办城市/i })).not.toBeInTheDocument();
  });

  it('renders a release-ready city detail page', () => {
    window.history.replaceState({}, '', '/cities/Mexico%20City');
    render(<App />);

    expect(screen.getByRole('heading', { name: /墨西哥城/i })).toBeInTheDocument();
    expect(screen.getAllByText(/墨西哥城球场/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /返回主办城市总览/ }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Estadio Azteca/)).toBeInTheDocument();
    expect(screen.getByText(/83,000 座/)).toBeInTheDocument();
    expect(screen.getByText(/19.3029/)).toBeInTheDocument();
    expect(screen.getAllByText(/承办比赛/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /打开比赛详情: 比赛 1/ })).toHaveAttribute('href', '/matches/1');
    expect(screen.getByRole('link', { name: /打开比赛详情: 比赛 92/ })).toHaveAttribute('href', '/matches/92');
    expect(screen.queryByText(/后续/)).not.toBeInTheDocument();
    expect(screen.queryByText(/当前页面/)).not.toBeInTheDocument();
  });

  it('renders the supplied host city map artwork with pre-positioned markers', () => {
    window.history.replaceState({}, '', '/zh/cities');
    render(<App />);

    expect(screen.getByTestId('cities-rendered-map')).toBeInTheDocument();
  });

  it('opens a manual layout editor on the cities page', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/zh/cities?edit=1');
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /打开布局编辑器/i }));

    expect(screen.getByText(/拖动海报改位置/)).toBeInTheDocument();
    expect(screen.getByLabelText(/当前海报布局配置/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/选择城市/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Vancouver' })).toBeInTheDocument();
  });
});
