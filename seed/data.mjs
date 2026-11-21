// Sample content for Plaza. Everything here is made up: the company (Finchley Home),
// its people, its product (the Finch thermostat) and every document and message.

export const SPACES = [
  { id: 'people', name: 'Everyone', about: 'Company-wide: handbook, policies, announcements' },
  { id: 'engineering', name: 'Engineering', about: 'Firmware, app and cloud' },
  { id: 'sales', name: 'Sales', about: 'Pricing, partners and deals' },
  { id: 'support', name: 'Support', about: 'Customer help and returns' },
  { id: 'operations', name: 'Operations', about: 'Shipping, stock and suppliers' },
  { id: 'leadership', name: 'Leadership', about: 'Plans and board material (restricted)' },
];

export const PEOPLE = [
  { id: 'ava', name: 'Ava Chen', role: 'Engineering lead', spaces: ['people', 'engineering', 'operations'] },
  { id: 'noor', name: 'Noor Haddad', role: 'Head of sales', spaces: ['people', 'sales', 'leadership'] },
  { id: 'luis', name: 'Luis Ortega', role: 'Firmware engineer', spaces: ['people', 'engineering'] },
  { id: 'priya', name: 'Priya Nair', role: 'App engineer', spaces: ['people', 'engineering', 'support'] },
  { id: 'tom', name: 'Tom Becker', role: 'Support lead', spaces: ['people', 'support'] },
  { id: 'dana', name: 'Dana Kim', role: 'Support agent', spaces: ['people', 'support'] },
  { id: 'mei', name: 'Mei Tanaka', role: 'People partner', spaces: ['people', 'leadership'] },
  { id: 'chloe', name: 'Chloe Martin', role: 'Recruiter', spaces: ['people'] },
  { id: 'sam', name: 'Sam Okafor', role: 'Operations manager', spaces: ['people', 'operations'] },
  { id: 'raj', name: 'Raj Patel', role: 'Warehouse lead', spaces: ['people', 'operations'] },
  { id: 'elena', name: 'Elena Rossi', role: 'Account executive', spaces: ['people', 'sales'] },
  { id: 'jonas', name: 'Jonas Weber', role: 'Chief executive', spaces: ['people', 'leadership', 'sales', 'engineering'] },
];

// [space, title, author, days ago, tags, body]
export const DOCUMENTS = [
  ['people', 'Time off policy', 'mei', 96, ['policy', 'time off'],
    `Every full-time employee gets 20 days of paid time off per calendar year, plus the 10 company holidays. Time off builds up monthly, so a new joiner has about 1.7 days after the first month.

Ask your manager at least two weeks ahead for anything longer than three days. Requests go in the People portal and are approved within two working days.

You can carry over up to 5 unused days into the next year. Carried days must be used by the end of March or they are lost. Unused days are not paid out, except where local law requires it.

Sick days are separate. You have 8 paid sick days a year and do not need a doctor's note for the first three in a row.`],
  ['people', 'Remote work policy', 'mei', 80, ['policy', 'remote'],
    `Finchley Home is a hybrid company. The Oakland office is open Monday to Thursday, and teams choose two shared office days each week. Engineering meets on Tuesday and Wednesday.

You may work from another city in your home country for up to four weeks a year without asking. Working from another country needs approval from the People team and Finance first, because of tax and insurance rules. The limit is 30 days a year, and requests take about ten working days to review.

The company pays up to 400 dollars once for home office equipment, and 50 dollars a month toward internet.`],
  ['people', 'Expense policy', 'mei', 75, ['policy', 'money'],
    `Spend company money the way you would spend your own. Submit expenses in the finance tool within 30 days, with a photo of the receipt for anything over 25 dollars.

Meals while travelling are covered up to 60 dollars a day. Flights are economy class; book at least 14 days ahead when you can. Hotels are covered up to 220 dollars a night, or 300 in New York, San Francisco and London.

Anything over 500 dollars needs your manager's approval before you buy it. Software subscriptions always go through the Operations team, so we do not pay twice for the same tool.`],
  ['people', 'Your first week', 'chloe', 60, ['onboarding'],
    `Day one starts at 10:00 in the Oakland office or on a video call. You get your laptop, your accounts and a short tour. Your buddy for the first month is named in your welcome email.

By Wednesday you should have installed a Finch thermostat at home or in the lab, because everyone here uses the product. By Friday you sit in on two support calls with Tom's team.

In week two you meet each space lead for 20 minutes. Bring questions. The 30, 60 and 90 day check-ins with your manager are already on your calendar.`],
  ['people', 'Parental leave', 'mei', 110, ['policy', 'family'],
    `Any parent, by birth or adoption, gets 16 weeks of fully paid parental leave. It can be taken in one block or split into two blocks within the first year.

Tell the People team at least three months before the expected date so cover can be planned. Your role, pay and equity keep building while you are away.

When you come back you may work four days a week at full pay for the first month.`],
  ['people', 'Performance reviews', 'mei', 45, ['policy', 'growth'],
    `Reviews happen twice a year, in June and December. Each review has three parts: your own notes, feedback from three colleagues you choose with your manager, and your manager's summary.

Pay changes are decided once a year in January and take effect on February 1. Promotions can happen in either cycle.

There are no ratings on a curve. The summary uses one of three plain statements: growing fast, on track, or needs support. Needs support always comes with a written plan and a check-in every two weeks.`],
  ['people', 'Oakland office guide', 'chloe', 30, ['office'],
    `The office is on the third floor at 410 Harbor Street, Oakland. Doors open at 8:00 and lock at 19:00. Your badge works from your first day.

Bike storage is in the basement; ask Sam for a key. There are 6 parking spaces, booked through the Operations calendar. Lunch is provided on Tuesday and Wednesday.

Guests sign in on the tablet at the front desk. The lab on the second floor needs a separate badge; ask Ava.`],
  ['people', 'Learning budget', 'mei', 20, ['policy', 'growth'],
    `Each person has 1,500 dollars a year for courses, books and conferences that relate to their work. Unused budget does not carry over.

Anything under 200 dollars needs no approval: buy it and expense it with the tag Learning. Above that, send your manager a two-line note on what you expect to learn.

Conference travel comes from the team travel budget, not from your learning budget. You also get 3 paid learning days a year that do not count as time off.`],

  ['engineering', 'Release process', 'ava', 50, ['process', 'release'],
    `We release the mobile app and the cloud services every second Thursday. Code freeze is Tuesday at 17:00 Pacific. Only fixes for release blockers are merged after the freeze, and each needs a second reviewer.

On Wednesday the release owner runs the full test suite on the staging environment and writes the release notes. On Thursday at 10:00 the release goes to 10 percent of users. If the error rate stays under 0.5 percent for four hours, it goes to everyone.

Rolling back takes about six minutes with the rollback script. The release owner rotates each cycle; the schedule is in the Engineering calendar.`],
  ['engineering', 'On-call guide', 'ava', 70, ['process', 'on-call'],
    `One engineer is on call each week, from Monday 10:00 to the next Monday 10:00. The pager covers the pairing service, the schedule service and the cloud API.

Acknowledge a page within 10 minutes. If you cannot fix it in 30 minutes, call the secondary, who is the person on call the week before. For anything that affects more than 5 percent of devices, open an incident channel and tell Support.

On-call pay is 400 dollars for the week, plus a day off if you are woken between midnight and 6:00.`],
  ['engineering', 'Firmware rollout plan', 'luis', 25, ['firmware', 'release'],
    `Firmware 4.2 adds the open-window detection feature and fixes the battery drain on Finch One. It ships in three waves.

Wave one is 2,000 employee and beta devices on November 23. Wave two is 10 percent of the fleet on November 30. Wave three is everyone on December 7, unless the failed-update rate in wave two is above 0.3 percent.

Devices update between 2:00 and 4:00 local time and only when they are on mains power or above 50 percent battery. A device that fails twice keeps the old firmware and reports it.`],
  ['engineering', 'API style guide', 'priya', 90, ['api', 'standards'],
    `All public endpoints use JSON over HTTPS and are versioned in the path, for example /v2/devices. Field names are in snake_case. Times are ISO 8601 in UTC.

Errors return a code, a message a person can read, and a request id. Never return a 200 with an error inside it. Lists are paged with a cursor, not page numbers, and return at most 100 items.

Breaking changes need a new version and six months of overlap. The rate limit is 120 requests a minute per token.`],
  ['engineering', 'Postmortem: pairing outage on October 14', 'ava', 36, ['incident', 'pairing'],
    `On October 14, new thermostats could not be paired for 2 hours and 10 minutes, from 9:05 to 11:15 Pacific. About 1,300 customers were affected. Devices already paired kept working.

The cause was an expired certificate on the pairing service. The renewal job had been failing quietly for three weeks because its alert pointed to a mailbox nobody read.

We fixed it by renewing the certificate by hand. Since then, certificate alerts go to the on-call pager, a dashboard shows days left on every certificate, and renewal now happens 30 days before expiry instead of 7.`],
  ['engineering', 'System overview', 'ava', 120, ['architecture'],
    `A Finch thermostat talks to the cloud over MQTT. The device gateway passes messages to three services: pairing, schedules and telemetry. The mobile app talks only to the cloud API, never to the device directly, except during first-time setup over Bluetooth.

Schedules live in PostgreSQL. Temperature readings go to a time-series store and are kept at full detail for 90 days, then as hourly averages for two years.

Everything runs in two regions. If one region fails, devices reconnect to the other within about a minute and keep following the schedule stored on the device.`],
  ['engineering', 'Code review rules', 'priya', 65, ['standards', 'review'],
    `Every change needs one approval; changes to pairing, billing or firmware signing need two. Keep changes under 400 lines where you can. Larger changes should come with a short design note.

Reviewers answer within one working day. Say what must change and what is only a suggestion. The author merges, not the reviewer.

Tests are part of the change. A fix without a test that fails before the fix will be sent back.`],
  ['engineering', 'Local development setup', 'luis', 15, ['setup'],
    `You need Docker, Node 22 and the Finch command line tool. Run finch dev up to start the cloud services, a fake device gateway and ten simulated thermostats.

The simulated devices behave like Finch Pro on firmware 4.1. To test firmware, flash a lab unit; there are twelve on the bench in the second-floor lab, labelled L1 to L12.

Staging data is reset every Sunday night. Never copy production data to your laptop.`],

  ['sales', 'Price list 2026', 'noor', 40, ['pricing'],
    `Finch One is 129 dollars. Finch Pro is 199 dollars and adds room sensors, open-window detection and energy reports. Extra room sensors are 39 dollars each or 99 for a pack of three.

Finch Care, the extended service plan, is 4 dollars a month or 40 a year. It includes a five-year warranty and priority support.

Installers buy at 20 percent below list. Property managers ordering 50 units or more get 25 percent, and 30 percent from 250 units.`],
  ['sales', 'Discount approval rules', 'noor', 38, ['pricing', 'process'],
    `An account executive may give up to 10 percent off list without asking. From 10 to 20 percent needs approval from the head of sales. Above 20 percent needs the chief executive, and a written reason in the deal record.

Never discount Finch Care. Free shipping can be offered on any order over 500 dollars.

Quotes are valid for 30 days. If a customer comes back after that, check the current price list before you honour the old number.`],
  ['sales', 'Installer partner program', 'elena', 55, ['partners'],
    `Installers join by finishing the two-hour online course and installing three units. Partners get the 20 percent trade price, a listing on our Find an Installer page, and a named contact in Support.

Gold partners are those who install more than 200 units a year. They get 25 percent, co-branded flyers and early access to new firmware.

We pay a 15 dollar referral fee for each Finch Care plan a partner sells.`],
  ['sales', 'Competitor notes', 'elena', 28, ['market'],
    `Three products come up most in deals. Nestwell is the best known and costs more; customers like its design and dislike that sensors are sold only in packs. ThermoLeaf is cheapest but has no room sensors. Brightzone is strong with property managers because of its dashboard.

Where we win: room sensors included with Pro, open-window detection, and a plain price with no required subscription. Where we lose: brand recognition and the missing web dashboard, which is planned for the second quarter of 2027.`],
  ['sales', 'Demo script', 'noor', 22, ['demo'],
    `Keep the demo to 15 minutes. Start with the problem: one thermostat in the hallway does not know the bedroom is cold. Then pair a Finch Pro live; it takes under two minutes.

Show the schedule screen, then open a window near the sensor and wait for the open-window alert, which arrives in about 90 seconds. End on the energy report.

Do not show the installer settings unless asked. Leave five minutes for questions and always ask how many units and which building type.`],

  ['support', 'Refund and return policy', 'tom', 85, ['policy', 'returns'],
    `Customers can return a Finch for a full refund within 60 days of delivery, for any reason. We send a prepaid label. The refund is issued within 5 working days of the unit reaching the warehouse.

After 60 days, returns are handled under warranty: we repair or replace, we do not refund. Units bought from a store go back to that store during the first 30 days.

Agents may refund up to 250 dollars without approval. Above that, ask the support lead.`],
  ['support', 'Fixing Wi-Fi pairing problems', 'dana', 18, ['troubleshooting', 'pairing'],
    `Most pairing failures are caused by the phone being on a 5 GHz network. Finch One only supports 2.4 GHz; Finch Pro supports both. Ask the customer to join the 2.4 GHz network first.

If the ring blinks orange, the thermostat cannot reach the router: move the router closer or check the password. If it blinks red three times, the C wire is missing or loose and the unit is running on battery only.

As a last step, hold the dial for 10 seconds to reset network settings, then pair again. This does not delete schedules.`],
  ['support', 'Escalation levels', 'tom', 62, ['process'],
    `Level 1 is the agent on the ticket. Level 2 is the support lead, for refunds above 250 dollars, safety complaints, and any ticket open more than 3 days.

Level 3 is Engineering on call. Use it when more than five customers report the same fault within an hour, or when a device may be unsafe. Page them from the incident tool, do not message individual engineers.

Tell the customer what happens next and when. We aim for a first reply within 4 hours and a fix or plan within 2 working days.`],
  ['support', 'Warranty terms', 'tom', 100, ['policy', 'warranty'],
    `Every Finch has a two-year warranty against faults in materials and workmanship. With Finch Care it is five years.

The warranty does not cover damage from wrong wiring, water, or power surges. If the customer used a listed installer partner, wiring faults are covered by the partner.

We ship the replacement first and ask for the old unit back within 30 days. If it does not come back, the card on file is charged the list price.`],

  ['operations', 'Shipping and stock', 'sam', 48, ['shipping', 'stock'],
    `Orders placed before 13:00 Pacific ship the same day from the Reno warehouse. Standard delivery takes 3 to 5 working days in the United States; express is 2 days and costs 12 dollars.

We keep six weeks of stock for each model. When stock falls under four weeks, Sam places a new order with the factory; lead time is 45 days by sea or 9 days by air.

Stock counts are checked every Friday against the warehouse system. A difference of more than 20 units is investigated the same day.`],
  ['operations', 'Suppliers', 'sam', 77, ['suppliers'],
    `The thermostats are built by Delmar Assembly in Penang. The minimum order is 5,000 units and payment is due 30 days after shipping.

Room sensors come from Kestrel Components. Packaging is printed by Arroyo Print in Sacramento, with a two-week turnaround.

Each supplier has a named contact and a backup. Contracts and price sheets are in the Operations drive; only Sam and Raj can change an order.`],
  ['operations', 'Handling returned units', 'raj', 33, ['returns', 'warehouse'],
    `Scan each returned box the day it arrives; the scan is what starts the customer's refund. Then test the unit on the bench: power, Wi-Fi, dial and screen.

Units that pass are cleaned, reset and sold as refurbished at 30 percent below list. Units that fail go in the blue bin and are sent to Delmar once a month for analysis.

Never put a returned unit back into new stock. Record the reason for return from the customer's form; Support and Engineering read that report every month.`],
  ['operations', 'Holiday shipping dates', 'sam', 12, ['shipping', 'holidays'],
    `For delivery by December 24, standard orders must be placed by December 15 and express orders by December 19. The warehouse is closed November 26 and 27, December 25 and January 1.

Expect three times the normal volume in the week of Black Friday. Raj is adding a second shift from November 23 to December 19.

Support should tell customers these dates plainly and not promise anything later.`],

  ['leadership', 'Fourth quarter priorities', 'jonas', 42, ['plan'],
    `Three things matter this quarter. First, ship firmware 4.2 with open-window detection before the holidays. Second, sign 40 new installer partners; we have 26 so far. Third, bring first-reply time in Support under 4 hours.

Revenue target for the quarter is 4.8 million dollars. We are at 2.9 million with six weeks left, and the holiday weeks usually bring about a third of the quarter.

We will not start the web dashboard this quarter. It moves to 2027.`],
  ['leadership', 'Hiring plan for 2027', 'mei', 26, ['plan', 'hiring'],
    `We plan to grow from 58 to 74 people in 2027. Engineering adds seven: three firmware, two app, two cloud. Support adds four, Sales adds three, Operations adds two.

The first hires, in January, are a second firmware lead and two support agents for the European time zone. Total added cost is about 2.4 million dollars for the year.

Hiring pauses if cash falls under 12 months of runway.`],
  ['leadership', 'Board meeting notes, October', 'jonas', 34, ['board'],
    `The board met on October 20. Revenue for the third quarter was 3.6 million dollars, up 22 percent on last year. Gross margin was 41 percent, held back by air freight in August.

The board approved the 2027 hiring plan and asked for a plan to lift margin to 45 percent. They also asked about the pairing outage and accepted the changes made.

The next meeting is January 19. Noor will present the property manager segment.`],
  ['leadership', 'Fundraising status', 'jonas', 9, ['funding'],
    `We are raising a 15 million dollar round to fund the European launch. Two firms have given term sheets and a third is in review. We expect to choose by December 12.

Cash in the bank covers 17 months at the current plan. We do not need the round to survive, which gives us room to choose the right partner.

Please keep this inside the Leadership space until it is announced.`],
];

// [space, title, author, days ago, first post, [[author, reply], ...]]
export const TOPICS = [
  ['engineering', 'Should we move the code freeze to Monday?', 'priya', 14,
    'Tuesday 17:00 leaves one day for testing and it felt rushed again last cycle. Moving the freeze to Monday would give two full days.',
    [['luis', 'Firmware would like that. Two days lets us run the overnight soak test before the release.'],
     ['ava', 'I am open to it. The cost is one day less for features. Let us try it for two cycles and compare the number of post-release fixes.'],
     ['jonas', 'Fine by me as a trial. Tell Sales which features slip, if any.']]],
  ['engineering', 'Battery drain on Finch One after 4.1', 'luis', 21,
    'Some Finch One units without a C wire lose 8 percent battery a day on 4.1, up from 3. I think the Wi-Fi radio is waking too often.',
    [['ava', 'Can you confirm with the lab units L3 and L4? They have no C wire.'],
     ['luis', 'Confirmed. The radio wakes every 30 seconds instead of every 5 minutes. The fix is in the 4.2 branch.'],
     ['tom', 'Support has 41 tickets about this. Can I tell customers December 7?']]],
  ['engineering', 'Which library for the new charts?', 'priya', 9,
    'The energy report needs new charts. I am choosing between drawing them ourselves and using a chart library.',
    [['ava', 'Use a library unless it adds more than 100 KB to the app.'],
     ['luis', 'Whatever you choose, make sure it works with the screen reader.']]],
  ['engineering', 'Lab booking is a mess', 'luis', 30,
    'Twice this week someone reflashed a lab unit I was in the middle of testing. Can we book the units?',
    [['ava', 'Yes. I added a Lab units calendar. Book L1 to L12 by the hour.'],
     ['priya', 'Thank you. Could L11 and L12 stay on the release firmware for support checks?'],
     ['ava', 'Done. L11 and L12 are marked do not flash.']]],
  ['engineering', 'Certificate alerts after the outage', 'ava', 33,
    'After October 14, every certificate alert goes to the pager. Reply here if you own a service whose certificate is not on the dashboard.',
    [['priya', 'The image upload service was missing. Added it.'],
     ['luis', 'Firmware signing keys are on a separate system and expire in 2029. I added a reminder anyway.']]],

  ['people', 'Lunch days are moving', 'chloe', 6,
    'From December, office lunch moves from Tuesday and Wednesday to Wednesday and Thursday, because more teams are in on Thursday.',
    [['priya', 'Engineering is in on Tuesday and Wednesday. Can we keep Tuesday?'],
     ['chloe', 'Fair point. Let me count badges per day for November and come back.'],
     ['sam', 'Whatever we choose, I need the order in by Friday noon each week.']]],
  ['people', 'Who wants a second bike rack?', 'sam', 17,
    'The basement rack is full by 9:00. A second one costs 600 dollars and takes two parking spaces.',
    [['luis', 'Yes please. I have been locking mine to the fence.'],
     ['elena', 'Fine with losing parking spaces, they are rarely full.'],
     ['sam', 'Ordered. It arrives the first week of December.']]],
  ['people', 'Question about carrying over days off', 'dana', 11,
    'I have 7 unused days. The policy says 5 carry over. What happens to the other 2?',
    [['mei', 'They are lost if not used by December 31, so please book them. If your team cannot spare you in December, tell me and we will find a way.'],
     ['tom', 'Dana, take the 22nd and 23rd. We are covered.']]],
  ['people', 'Winter party', 'chloe', 5,
    'The winter party is on Thursday, December 17 at 18:00 at the Pier 9 hall. Partners are welcome. Please reply in the form by December 4.',
    [['raj', 'Can the warehouse team in Reno join? We could drive down.'],
     ['chloe', 'Yes, and the company pays for the hotel that night.']]],
  ['people', 'New parking booking rule', 'sam', 40,
    'Parking spaces must now be booked the day before, by 17:00. Unbooked cars may be asked to move.',
    [['elena', 'Can customers park there during visits?'],
     ['sam', 'Yes, book it under Guest and put the customer name in the note.']]],

  ['sales', 'Brightzone is undercutting us with property managers', 'elena', 13,
    'I lost the Alder Properties deal, 320 units, to Brightzone. They offered 35 percent off and a free dashboard.',
    [['noor', 'We cannot match 35 percent. What did the customer say about room sensors?'],
     ['elena', 'They liked them but said the dashboard mattered more. They manage 11 buildings.'],
     ['jonas', 'This is the third deal lost to the dashboard. I will raise it at the planning meeting.']]],
  ['sales', 'Can we quote Finch Care for three years?', 'elena', 19,
    'A customer wants to pay for three years of Finch Care up front. The price list has monthly and yearly only.',
    [['noor', 'Quote three times the yearly price, 120 dollars. No discount on Care, as the rules say.'],
     ['elena', 'Done, they accepted.']]],
  ['sales', 'Installer partner count', 'noor', 8,
    'We are at 26 new partners this quarter against a target of 40. Ideas for the last six weeks?',
    [['elena', 'The trade show in Sacramento on December 3. Last year we signed nine there.'],
     ['jonas', 'Offer the first 20 units at the gold price for anyone who signs before year end.'],
     ['noor', 'Good. I will write it up and send it to the partner list on Monday.']]],
  ['sales', 'Demo units keep disappearing', 'noor', 27,
    'We have 6 demo units and I can find 3. If you have one at home, please bring it back or tell me.',
    [['elena', 'I have one, it is at the Alder Properties office. Picking it up Thursday.'],
     ['sam', 'I can send four refurbished units to use as demos.']]],

  ['support', 'Orange ring tickets are up', 'dana', 10,
    'We had 60 orange ring tickets last week, double the usual. Most are Finch One on new mesh routers.',
    [['priya', 'Mesh routers move devices between bands. Ask customers to turn off band steering during pairing.'],
     ['tom', 'I added that step to the pairing article.'],
     ['dana', 'It works. Twelve of twelve fixed today.']]],
  ['support', 'Refund limit for agents', 'tom', 44,
    'Raising the amount an agent can refund without approval from 150 to 250 dollars, starting today. This covers a Finch Pro with a sensor pack.',
    [['dana', 'Thank you. That removes about ten approvals a day.'],
     ['noor', 'Please tell Sales when a refund is for a partner order.']]],
  ['support', 'Holiday cover', 'tom', 7,
    'I need two volunteers for December 24 and 26. Double pay and a day off in January.',
    [['dana', 'I can do the 26th.'],
     ['priya', 'I can be the engineering contact on both days.']]],
  ['support', 'Customers asking about the web dashboard', 'dana', 16,
    'Property managers keep asking for a web dashboard. What should we say?',
    [['tom', 'Say it is planned for 2027 and do not give a month. Log each request with the number of units.'],
     ['noor', 'Send me those logs weekly, they help the case.']]],

  ['operations', 'Air freight in December?', 'sam', 15,
    'Finch Pro stock is at 3.5 weeks. Sea freight arrives January 6. Air freight for 4,000 units costs 38,000 dollars more.',
    [['raj', 'At the Black Friday rate we run out around December 18.'],
     ['jonas', 'Fly 2,000 units, not 4,000. Running out before the 24th costs more than the freight.'],
     ['sam', 'Booked. They land December 9.']]],
  ['operations', 'Second shift at the warehouse', 'raj', 12,
    'The second shift runs 14:00 to 22:00 from November 23 to December 19. I have hired six temporary packers.',
    [['sam', 'Good. Does same-day shipping still cut off at 13:00?'],
     ['raj', 'With the second shift we can move the cut-off to 16:00 for those four weeks.'],
     ['tom', 'Support will tell customers 16:00 from the 23rd.']]],
  ['operations', 'Packaging change', 'sam', 29,
    'Arroyo Print can make the box 12 percent smaller, which fits 15 percent more units on a pallet. It needs a new insert.',
    [['raj', 'We tested ten drops from one metre with the sample. No damage.'],
     ['ava', 'Please keep the QR code for pairing on the inside flap.']]],

  ['leadership', 'Dashboard: build or buy', 'jonas', 12,
    'We have lost three property manager deals to the missing dashboard. Options: build it in the second quarter, or license one and brand it.',
    [['noor', 'Licensing could be live in February. I would rather have something plain soon than something perfect in June.'],
     ['mei', 'Building needs the two cloud hires, who start in March at the earliest.'],
     ['jonas', 'Let us get a quote for licensing before the board meeting on January 19.']]],
  ['leadership', 'Margin plan', 'jonas', 24,
    'The board wants gross margin at 45 percent, up from 41. Ideas so far: less air freight, the smaller box, and a price rise on sensors.',
    [['noor', 'A sensor price rise from 39 to 45 dollars would not lose deals; nobody compares sensor prices.'],
     ['mei', 'Please decide before the January pay review so the budget is clear.']]],
];

// [space, title, days from today (negative is past), start hour, hours long, place, note]
export const EVENTS = [
  ['engineering', 'Code freeze', 5, 17, 0, 'Online', 'Only release blocker fixes after this.'],
  ['engineering', 'Release 6.14 goes out', 7, 10, 4, 'Online', 'Ten percent first, everyone after four hours if the error rate is low.'],
  ['engineering', 'Firmware 4.2 wave one', 4, 2, 2, 'Fleet', 'Employee and beta devices, 2,000 units.'],
  ['engineering', 'Firmware 4.2 wave two', 11, 2, 2, 'Fleet', 'Ten percent of all devices.'],
  ['engineering', 'Firmware 4.2 wave three', 18, 2, 2, 'Fleet', 'All devices, if wave two failed updates stay under 0.3 percent.'],
  ['engineering', 'Postmortem review: pairing outage', -30, 14, 1, 'Room Tide', 'Walk through the October 14 outage and the follow-up actions.'],
  ['engineering', 'Architecture hour', 2, 15, 1, 'Room Tide', 'Priya presents the new energy report design.'],
  ['engineering', 'On-call handover', 3, 10, 0.5, 'Online', 'Weekly handover between on-call engineers.'],
  ['engineering', 'Lab clean-up', 9, 16, 1, 'Second-floor lab', 'Label every unit and return borrowed cables.'],
  ['people', 'All-hands meeting', 6, 9, 1, 'Main room and online', 'Jonas on the quarter so far, Ava on firmware 4.2, questions.'],
  ['people', 'Winter party', 28, 18, 4, 'Pier 9 hall', 'Partners welcome. Reply by December 4.'],
  ['people', 'New joiner welcome', 3, 10, 2, 'Oakland office', 'Laptops, accounts and a tour for the three people starting this week.'],
  ['people', 'Benefits enrolment closes', 15, 17, 0, 'People portal', 'Last day to change health plans for 2027.'],
  ['people', 'Office closed: Thanksgiving', 7, 0, 48, 'Oakland office', 'Closed November 26 and 27.'],
  ['people', 'December performance reviews open', 12, 9, 0, 'People portal', 'Write your own notes and choose three colleagues for feedback.'],
  ['people', 'Fire drill', 10, 11, 0.5, 'Oakland office', 'Meet at the corner of Harbor and 4th.'],
  ['people', 'Lunch and learn: how the thermostat learns', -6, 12, 1, 'Main room', 'Luis explains the schedule model with a live unit.'],
  ['sales', 'Pipeline review', 1, 9, 1, 'Room Gull', 'Every open deal over 50 units.'],
  ['sales', 'Sacramento trade show', 14, 9, 8, 'Sacramento Convention Center', 'Booth 214. Goal: nine new installer partners.'],
  ['sales', 'Partner webinar: firmware 4.2', 8, 11, 1, 'Online', 'Open-window detection for installers, with Luis.'],
  ['sales', 'Quarter close', 42, 17, 0, 'Online', 'All signed orders must be in the system.'],
  ['sales', 'Alder Properties follow-up call', -2, 15, 0.5, 'Online', 'Ask what would bring them back when the dashboard exists.'],
  ['support', 'Support weekly', 2, 9, 0.75, 'Room Gull', 'Ticket numbers, top three problems, anything for Engineering.'],
  ['support', 'Pairing article walkthrough', -4, 13, 0.5, 'Online', 'Dana shows the new band steering step.'],
  ['support', 'Holiday cover starts', 35, 8, 0, 'Online', 'Reduced team December 24 to 26.'],
  ['support', 'Listening session with Engineering', 13, 14, 1, 'Main room', 'Engineers listen to ten recorded calls.'],
  ['operations', 'Friday stock count', 1, 8, 2, 'Reno warehouse', 'Count against the warehouse system.'],
  ['operations', 'Second shift starts', 4, 14, 8, 'Reno warehouse', 'Six temporary packers, runs to December 19.'],
  ['operations', 'Air freight lands', 20, 6, 0, 'Reno warehouse', 'Two thousand Finch Pro units.'],
  ['operations', 'Last day for standard holiday delivery', 26, 13, 0, 'Online store', 'Orders after this need express.'],
  ['operations', 'Supplier call with Delmar', 5, 18, 1, 'Online', 'January order and the returned unit report.'],
  ['leadership', 'Planning meeting', 3, 13, 2, 'Room Tide', 'Dashboard build or buy, margin plan.'],
  ['leadership', 'Investor decision', 23, 12, 0, 'Online', 'Choose between the term sheets.'],
  ['leadership', 'Board meeting', 61, 9, 3, 'Main room', 'Noor presents the property manager segment.'],
];

// [space, author, days ago, hour, text]
export const MESSAGES = [
  ['engineering', 'luis', 0, 9, 'Morning. Soak test for 4.2 passed overnight on all twelve lab units.'],
  ['engineering', 'ava', 0, 9, 'Great news. Any failed updates?'],
  ['engineering', 'luis', 0, 9, 'None. L3 took two tries because the battery was at 48 percent, which is the rule working as designed.'],
  ['engineering', 'priya', 0, 10, 'The energy report screen is ready for review, link in the pull request.'],
  ['engineering', 'ava', 0, 10, 'I will review after lunch. Who is release owner this cycle?'],
  ['engineering', 'priya', 0, 10, 'Me. Luis is next cycle.'],
  ['engineering', 'luis', 1, 15, 'Staging is slow today, the telemetry store is rebuilding an index.'],
  ['engineering', 'ava', 1, 15, 'It should be done by 16:00. Do not restart it please.'],
  ['engineering', 'priya', 1, 16, 'Reminder: code freeze is Tuesday 17:00.'],
  ['engineering', 'luis', 2, 11, 'Does anyone have the USB debug cable for the Finch Pro? The one with the green tape.'],
  ['engineering', 'priya', 2, 11, 'It is on my desk, sorry. Bringing it to the lab now.'],
  ['engineering', 'ava', 3, 14, 'The pager was quiet all weekend. Thank you Luis for covering.'],
  ['engineering', 'luis', 3, 14, 'One page, a false alarm from the schedule service at 3:00. I raised the threshold.'],
  ['engineering', 'ava', 5, 10, 'Rollback drill on Thursday took 5 minutes 40 seconds. Under our six minute goal.'],
  ['engineering', 'priya', 6, 13, 'The API rate limit caught a partner script doing 900 requests a minute. I emailed them.'],
  ['engineering', 'jonas', 6, 14, 'Thanks. Which partner?'],
  ['engineering', 'priya', 6, 14, 'Coastline Heating. It was a loop in their stock sync, they have fixed it.'],
  ['engineering', 'luis', 8, 9, 'Open-window detection now triggers in 85 seconds on average in the lab, down from 140.'],
  ['engineering', 'ava', 8, 9, 'That is a big improvement. Sales will be happy for the demo.'],
  ['engineering', 'priya', 12, 16, 'Certificate dashboard is live. The shortest one has 61 days left.'],

  ['people', 'chloe', 0, 8, 'Three new people start today: two in Support and one in Operations. Say hello in the kitchen.'],
  ['people', 'mei', 0, 11, 'Benefits enrolment closes on December 4. It takes ten minutes in the People portal.'],
  ['people', 'sam', 0, 12, 'Lunch today is from the taco place. Vegetarian trays are labelled.'],
  ['people', 'jonas', 1, 9, 'All-hands is next Wednesday at 9:00. Send questions to Mei beforehand if you prefer.'],
  ['people', 'tom', 1, 13, 'Someone left a blue umbrella in Room Gull.'],
  ['people', 'elena', 1, 13, 'Mine, thank you.'],
  ['people', 'chloe', 2, 10, 'The winter party form is open. 31 replies so far.'],
  ['people', 'raj', 2, 15, 'Reno team is coming to the party, nine of us.'],
  ['people', 'mei', 4, 9, 'Reminder that unused days off beyond 5 do not carry over. Please book them.'],
  ['people', 'dana', 4, 10, 'Is the office open the Friday after Thanksgiving?'],
  ['people', 'chloe', 4, 10, 'No, it is closed on the 26th and 27th.'],
  ['people', 'sam', 7, 16, 'The new bike rack is ordered and arrives the first week of December.'],
  ['people', 'luis', 9, 12, 'Lunch and learn today at noon: how the thermostat learns your schedule.'],
  ['people', 'mei', 13, 11, 'The learning budget resets on January 1. You have until then to use this year\'s 1,500 dollars.'],
  ['people', 'jonas', 15, 17, 'Thank you all for the work on the outage follow-up. The board noticed.'],

  ['sales', 'elena', 0, 9, 'Signed Harlan Plumbing as an installer partner this morning. That makes 27.'],
  ['sales', 'noor', 0, 9, 'Well done. Thirteen to go.'],
  ['sales', 'elena', 0, 11, 'Customer asks if Finch Pro works with heat pumps.'],
  ['sales', 'noor', 0, 11, 'Yes, single and two stage. Not with the older line-voltage baseboard heaters.'],
  ['sales', 'noor', 1, 10, 'Year-end partner offer goes out Monday: first 20 units at the gold price.'],
  ['sales', 'jonas', 1, 10, 'Approved. Please cap it at 60 new partners.'],
  ['sales', 'elena', 2, 14, 'Demo at Marsh Street Apartments went well. They want a quote for 140 units.'],
  ['sales', 'noor', 2, 14, 'That is 25 percent by the price list. Send it today, valid 30 days.'],
  ['sales', 'elena', 4, 16, 'Booth materials for Sacramento are printed. Booth 214.'],
  ['sales', 'noor', 6, 9, 'Quarter is at 2.9 million against 4.8. The holiday weeks will decide it.'],
  ['sales', 'elena', 9, 11, 'Lost Alder Properties to Brightzone. Details in the discussion.'],
  ['sales', 'noor', 11, 15, 'New price list for 2026 is in Documents. Sensors pack is 99.'],

  ['support', 'dana', 0, 8, 'Queue this morning: 84 open, oldest is 2 days.'],
  ['support', 'tom', 0, 8, 'Good. Welcome to the two new agents, they shadow Dana today.'],
  ['support', 'dana', 0, 10, 'Customer in Denver has a red blinking ring. Missing C wire, sending an adapter.'],
  ['support', 'tom', 0, 14, 'First reply time yesterday was 3 hours 20 minutes. Under four for the first time this quarter.'],
  ['support', 'priya', 1, 11, 'The fix for the schedule not saving on older phones is in release 6.14.'],
  ['support', 'dana', 1, 11, 'Thank you, I have 15 tickets waiting on that.'],
  ['support', 'tom', 2, 9, 'From the 23rd tell customers the same-day shipping cut-off is 16:00.'],
  ['support', 'dana', 3, 15, 'Band steering step works. Orange ring tickets are down by half.'],
  ['support', 'tom', 5, 12, 'Reminder: refunds over 250 dollars come to me.'],
  ['support', 'dana', 8, 10, 'A customer returned a unit after 70 days. I offered repair under warranty, as the policy says.'],
  ['support', 'tom', 10, 16, 'Battery drain on Finch One is fixed in firmware 4.2, for everyone on December 7.'],

  ['operations', 'raj', 0, 7, 'Friday count done. Finch One is 4 units over, Finch Pro matches.'],
  ['operations', 'sam', 0, 8, 'Good. Four is inside the limit.'],
  ['operations', 'raj', 0, 13, 'Shipped 612 orders by the cut-off today.'],
  ['operations', 'sam', 1, 10, 'Air freight is booked. Two thousand Finch Pro land December 9.'],
  ['operations', 'raj', 1, 10, 'I will have the dock clear that morning.'],
  ['operations', 'sam', 2, 15, 'Delmar confirmed the January order: 10,000 units, ships by sea on December 28.'],
  ['operations', 'ava', 3, 11, 'Can I get five refurbished Finch One units for the lab?'],
  ['operations', 'raj', 3, 11, 'Yes, they go out with tomorrow\'s courier to Oakland.'],
  ['operations', 'sam', 5, 9, 'The smaller box is approved. Arroyo prints the first run next week.'],
  ['operations', 'raj', 7, 14, 'Six temporary packers have finished training.'],
  ['operations', 'sam', 10, 16, 'Finch Pro stock is at 3.5 weeks. Opening a discussion about air freight.'],

  ['leadership', 'jonas', 0, 8, 'Third term sheet arrived last night. Sending a comparison this afternoon.'],
  ['leadership', 'noor', 0, 8, 'Happy to join the calls if they want to hear about the property manager segment.'],
  ['leadership', 'mei', 1, 10, 'Offer accepted by the second firmware lead. She starts January 11.'],
  ['leadership', 'jonas', 1, 10, 'Excellent. That was the hardest role on the plan.'],
  ['leadership', 'noor', 3, 16, 'Licensing quote for the dashboard: 90,000 dollars a year, live in about ten weeks.'],
  ['leadership', 'jonas', 3, 16, 'Thanks. That goes on Thursday\'s planning agenda.'],
  ['leadership', 'mei', 6, 11, 'Cash runway is at 17 months after the October numbers.'],
];
