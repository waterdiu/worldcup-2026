import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../App';
import { bracket, finalsMatchResults, groups, tournamentMeta } from '../data';
import { contentByLocale } from '../i18n/content';
import { StatsPage } from '../pages/StatsPage';

describe('App routes', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('uses the GitHub Pages base path for internal navigation links', () => {
    vi.stubEnv('BASE_URL', '/worldcup-2026/');

    try {
      window.history.replaceState({}, '', '/worldcup-2026/stats');
      render(<App />);

      expect(screen.getByRole('heading', { name: '统计' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '首页' })).toHaveAttribute('href', '/worldcup-2026/');
      expect(screen.getByRole('link', { name: '预选赛' })).toHaveAttribute('href', '/worldcup-2026/qualifiers');
      expect(screen.getByRole('link', { name: '统计' })).toHaveAttribute('href', '/worldcup-2026/stats');
      expect(screen.getByRole('link', { name: '我的' })).toHaveAttribute('href', '/worldcup-2026/me');
    } finally {
      cleanup();
      vi.unstubAllEnvs();
    }
  });

  it('renders the signed-out user center with Google login', () => {
    window.history.replaceState({}, '', '/me');
    render(<App />);

    expect(screen.getByRole('heading', { name: /我的世界杯/i })).toBeInTheDocument();
    expect(screen.getByText(/登录后可以同步收藏和预测/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /使用 Google 登录/i })).toBeInTheDocument();
    expect(screen.getByText(/我的收藏/i)).toBeInTheDocument();
    expect(screen.getByText(/我的预测/i)).toBeInTheDocument();
  });

  it('renders the chinese homepage at the root route with unprefixed navigation links', () => {
    window.history.replaceState({}, '', '/');
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /2026 世界杯/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '12 小组详情' })).toHaveAttribute(
      'href',
      '/groups'
    );
    expect(screen.getByRole('link', { name: '48 支参赛队详情' })).toHaveAttribute(
      'href',
      '/teams'
    );
    expect(screen.getByRole('link', { name: '104 场比赛详情' })).toHaveAttribute(
      'href',
      '/matches'
    );
    expect(screen.getByRole('link', { name: '16 个主办城市详情' })).toHaveAttribute(
      'href',
      '/cities'
    );
  });

  it('renders the english homepage at the /en route with prefixed navigation links', () => {
    window.history.replaceState({}, '', '/en');
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /World Cup 2026/i })
    ).toBeInTheDocument();
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

    expect(
      screen.getByRole('heading', { name: /2026 世界杯/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '12 小组详情' })).toHaveAttribute(
      'href',
      '/groups'
    );
    expect(screen.getByRole('link', { name: '48 支参赛队详情' })).toHaveAttribute(
      'href',
      '/teams'
    );
  });

  it('shows promo and opening-match hero slides on the homepage', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    expect(screen.getByRole('heading', { name: /2026 世界杯/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /官方宣传片/i })).toBeInTheDocument();
    expect(screen.queryByText(/观看官方宣传片/)).not.toBeInTheDocument();
    expect(screen.queryByText(/进入揭幕战详情/)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /揭幕战/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/🇲🇽 墨西哥 vs 🇿🇦 南非/)).not.toBeInTheDocument();
    expect(container.querySelector('.home-hero__poster--opening')).not.toBeInTheDocument();
    expect(container.querySelector('.home-hero__cutout--home')).not.toBeInTheDocument();
    expect(container.querySelector('.home-hero__cutout--away')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/进入揭幕战详情页/i)).toHaveAttribute('href', '/matches/1');

    await user.click(screen.getByLabelText(/打开官方宣传片/i));
    expect(screen.getByLabelText(/官方宣传片播放器/i)).toHaveAttribute(
      'src',
      '/worldcup-assets/2026worldcup.mp4'
    );
    expect(screen.getByLabelText(/官方宣传片播放器/i)).toHaveClass('home-hero__video--contain');
    expect(screen.getByLabelText(/进入揭幕战详情页/i)).toHaveAttribute('href', '/matches/1');
  });

  it('pauses hero auto-advance while the promo video is playing and lets progress bars switch slides', async () => {
    vi.useFakeTimers();
    render(<App />);

    const firstMarker = screen.getByRole('button', { name: '切换到第 1 页' });
    const secondMarker = screen.getByRole('button', { name: '切换到第 2 页' });
    expect(firstMarker).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByLabelText(/打开官方宣传片/i));
    act(() => {
      vi.advanceTimersByTime(12000);
    });

    expect(screen.getByLabelText(/官方宣传片播放器/i)).toBeInTheDocument();
    expect(firstMarker).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(secondMarker);
    expect(secondMarker).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText(/进入揭幕战详情页/i)).toHaveAttribute('href', '/matches/1');

    vi.useRealTimers();
  });

  it('renders dense metric cards on the homepage', () => {
    render(<App />);

    expect(screen.getAllByText(/A 组/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/L 组/)).not.toBeInTheDocument();
    expect(screen.getByText('胜')).toBeInTheDocument();
    expect(screen.getByText('平')).toBeInTheDocument();
    expect(screen.getByText('负')).toBeInTheDocument();
    expect(screen.getByText('进')).toBeInTheDocument();
    expect(screen.getByText('失')).toBeInTheDocument();
    expect(screen.getByText('分')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/进入球队详情:/).length).toBeGreaterThan(10);
    expect(screen.getAllByText(/6月11日/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/待定/).length).toBeGreaterThan(1);
    expect(screen.getByLabelText(/进入球队详情: Mexico/)).toHaveAttribute('data-team-name', '墨西哥');
    expect(screen.getAllByText(/球队/).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/进入城市详情:/).length).toBeGreaterThan(4);
    expect(screen.getByTitle(/美国 \/ 亚特兰大 \/ 亚特兰大球场/)).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /球场图片$/ }).length).toBe(16);
  });

  it('keeps long team names on one line by shrinking font in the home groups card', () => {
    vi.useFakeTimers();
    render(<App />);

    act(() => {
      vi.advanceTimersByTime(3600 * 10);
    });

    const longName = screen.getByText(/刚果（金）/);
    expect(longName).toHaveClass('group-carousel__team-name', 'is-xlong');

    vi.useRealTimers();
  });

  it('uses only the custom team tooltip and lets group markers switch slides', async () => {
    const user = userEvent.setup();
    render(<App />);

    const scotlandChip = screen.getByLabelText(/进入球队详情: Scotland/);
    expect(scotlandChip).toHaveAttribute('data-team-name', '苏格兰');
    expect(scotlandChip).not.toHaveAttribute('title');

    const marker = screen.getByRole('button', { name: '切换到 B 组' });
    await user.click(marker);

    expect(screen.getByText(/B 组/)).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('shows a single elevated tooltip for hovered team flags', async () => {
    const user = userEvent.setup();
    render(<App />);

    const moroccoChip = screen.getByLabelText(/进入球队详情: Morocco/);
    await user.hover(moroccoChip);

    expect(screen.getByText('摩洛哥')).toBeInTheDocument();
  });

  it('renders the qualifiers overview page', () => {
    window.history.replaceState({}, '', '/qualifiers');
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /世界杯预选赛比赛记录/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /亚足联/i })).toBeInTheDocument();
    expect(screen.getAllByText(/阿联酋/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/伊拉克/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole('link', { name: /打开预选赛详情: .*阿联酋 对 .*伊拉克/i })
    ).toHaveAttribute('href', '/qualifiers/matches/afc-uae-iraq-2025-11-13');
    expect(screen.getByText(/数据缺失统计/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /缺失数据报告/i })).toBeInTheDocument();
    expect(screen.getByText(/United Arab Emirates 1-1 Iraq/i)).toBeInTheDocument();
    expect(screen.getAllByText(/球员赛后评分/i).length).toBeGreaterThan(0);
  });

  it('renders a qualifier match detail page with stats, events, lineups, ratings, and missing data', () => {
    window.history.replaceState({}, '', '/qualifiers/matches/afc-uae-iraq-2025-11-13');
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /预选赛比赛详情/i })
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
    expect(screen.getByRole('heading', { name: /2026 世界杯 · 官方宣传片/i })).toBeInTheDocument();
  });

  it('renders the stats page from the primary navigation', () => {
    window.history.replaceState({}, '', '/stats');
    render(<App />);

    expect(screen.getByRole('link', { name: '统计' })).toHaveAttribute('href', '/stats');
    expect(screen.queryByRole('link', { name: '正赛' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /统计/i })).toBeInTheDocument();
    expect(screen.getByText(/免费公开数据/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /总览 KPI/i })).toBeInTheDocument();
    expect(screen.getAllByText(/104/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/待开赛/).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /比分分布/i })).toBeInTheDocument();
    expect(screen.getAllByText(/开赛后根据免费比分数据自动生成/).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /球队攻防指数/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /数据源状态/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Generated schedule scaffold/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/openfootball/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/football-data.org/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/API-Football 免费档/i).length).toBeGreaterThan(0);
  });

  it('derives stats page metrics from completed finals results', () => {
    const completedResults = finalsMatchResults.map((match) =>
      match.id === '1'
        ? {
            ...match,
            status: 'completed' as const,
            homeScore: 2,
            awayScore: 1,
            goals: [
              { minute: '12', team: 'Mexico', player: 'Example scorer' },
              { minute: '54', team: 'South Africa', player: 'Example equalizer' },
              { minute: '88', team: 'Mexico', player: 'Example winner' }
            ],
            sourceLabel: 'Local test result',
            updatedAt: '2026-06-11'
          }
        : match
    );

    render(
      <StatsPage
        meta={tournamentMeta}
        groups={groups}
        results={completedResults}
        rounds={bracket}
        dataCoverage={{
          updatedAt: '2026-06-11',
          sourceLabel: 'Local test result',
          scoreCoveragePct: 1,
          goalEventCoveragePct: 100,
          issueCount: 0
        }}
        copy={contentByLocale.zh}
      />
    );

    expect(screen.getByText(/1 场已完赛/)).toBeInTheDocument();
    expect(screen.getAllByText(/^3$/).length).toBeGreaterThan(0);
    expect(screen.getByText(/场均 3.00/)).toBeInTheDocument();
    expect(screen.getAllByText(/2-1/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1 次/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/🇲🇽 墨西哥/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/🇿🇦 南非/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Example scorer/)).toBeInTheDocument();
    expect(screen.getByText(/数据更新 2026-06-11/)).toBeInTheDocument();
    expect(screen.getByText(/进球事件覆盖 100%/)).toBeInTheDocument();
  });

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
    expect(screen.getByText(/世界排名第 15 位/)).toBeInTheDocument();
    expect(screen.queryByText(/查看详情/)).not.toBeInTheDocument();
    expect(screen.queryByText(/后续/)).not.toBeInTheDocument();
    expect(screen.queryByText(/当前页面/)).not.toBeInTheDocument();

    cleanup();
    window.history.replaceState({}, '', '/teams/Mexico');
    render(<App />);

    expect(screen.getAllByRole('heading', { name: /墨西哥/ }).length).toBeGreaterThan(0);
    expect(screen.getByTestId('team-detail-stack')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /球队基本信息/ })).toBeInTheDocument();
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
    expect(screen.getByRole('heading', { name: /1970 墨西哥世界杯/ })).toBeInTheDocument();
    expect(screen.getAllByTestId('world-cup-history-toggle')).toHaveLength(17);
    expect(screen.queryByText(/墨西哥 4-0 萨尔瓦多/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /展开 1970 墨西哥世界杯/ }));

    expect(screen.getByText(/墨西哥 4-0 萨尔瓦多/)).toBeInTheDocument();
    expect(screen.getAllByTestId('world-cup-match-row')).toHaveLength(4);
    expect(screen.getByRole('heading', { name: /1986 墨西哥世界杯/ })).toBeInTheDocument();
    expect(screen.queryByText(/墨西哥 0-0 西德（点球 1-4）/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /2022 卡塔尔世界杯/ })).toBeInTheDocument();
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
    expect(screen.getByText(/官方最终名单待公布/)).toBeInTheDocument();
    expect(screen.getByText(/FIFA 计划于 2026 年 6 月 2 日确认/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /人员名单/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /核心球员观察/ })).not.toBeInTheDocument();
    expect(screen.getAllByTestId('team-person-row')).toHaveLength(7);
    expect(screen.getByText(/Santiago Gimenez/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Edson Alvarez/ })).toBeInTheDocument();
    expect(screen.getAllByText(/名单状态：待官方最终确认/).length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('team-match-card')).toHaveLength(3);
    expect(screen.getByText(/🇲🇽 墨西哥 对 🇿🇦 南非/)).toBeInTheDocument();
    expect(screen.getByText(/🇲🇽 墨西哥 对 🇰🇷 韩国/)).toBeInTheDocument();
    expect(screen.getByText(/🇲🇽 墨西哥 对 🇨🇿 捷克/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /打开比赛详情: 墨西哥 对 南非/ })).toHaveAttribute('href', '/matches/1');
    expect(screen.getByRole('link', { name: /打开比赛详情: 墨西哥 对 捷克/ })).toHaveAttribute('href', '/matches/A-5');
    expect(screen.queryByText(/进入比赛详情/)).not.toBeInTheDocument();
    expect(screen.queryByText(/胜平负展示位/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/墨西哥城球场/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/后续/)).not.toBeInTheDocument();
    expect(screen.queryByText(/当前页面/)).not.toBeInTheDocument();
  });

  it('renders a release-ready matches overview with knockout route context', () => {
    window.history.replaceState({}, '', '/matches');
    const { container } = render(<App />);

    expect(screen.getByRole('heading', { name: '赛程总览' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /赛程中心/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '小组赛' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '淘汰赛' })).toBeInTheDocument();
    expect(screen.getAllByTestId('match-overview-group-card')).toHaveLength(72);
    expect(screen.getByRole('link', { name: /打开比赛详情: 墨西哥 对 捷克/ })).toHaveAttribute('href', '/matches/A-5');
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
    window.history.replaceState({}, '', '/matches/A-5');
    render(<App />);

    expect(screen.getByRole('heading', { name: /比赛详情/ })).toBeInTheDocument();
    expect(screen.getByText(/🇲🇽 墨西哥 对 🇨🇿 捷克/)).toBeInTheDocument();
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
