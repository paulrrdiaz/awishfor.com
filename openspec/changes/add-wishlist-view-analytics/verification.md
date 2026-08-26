## Public wishlist performance audit

Run on 2026-08-25 with `pnpm audit:public-wishlist`.

| Fixture | Previous mobile JavaScript | Current mobile JavaScript | Delta | Budget | Headroom |
| --- | ---: | ---: | ---: | ---: | ---: |
| Light | 216,075 B | 216,160 B | +85 B | 225,280 B | 9,120 B |
| Heavy | 216,075 B | 216,160 B | +85 B | 225,280 B | 9,120 B |

All mobile runs scored 100 and both fixtures stayed within every configured public-wishlist budget. The full measurement is stored in `artifacts/public-wishlist-performance/summary.json`.
