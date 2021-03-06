
define(["underscore", "backbone", "mustache", "GameTestHelper", "text!GameTestInstanceView.html"], function(_, Backbone, Mustache, GameTestHelper, GameTestInstanceViewTemplate) {

    var GameTestInstanceView = Backbone.View.extend({

        tagName: 'div',

        initialize: function() {
            this.test = this.options.test;
            this.questions = this.options.questions;
            this.listenTo(this.model, "change", this.render);
            this.listenTo(this.test, "change", this.render);
        },

        render: function() {
            var that = this;
            var testOptions = this.test.get("options");

            var data = {};
            data.title = this.test.get("title");
            var hwNumber = this.test.get("number");
            data.number = hwNumber;
            data.set = this.test.get("set");
            data.tiid = this.model.get("tiid");

            var modelData = this.model.get("modelData");
            data.hwScore = GameTestHelper.renderHWScore(this.model, this.test, testOptions);
            data.scoreBar = GameTestHelper.renderHWScoreBar(this.model, this.test, testOptions);

            var dueDate = new Date(this.test.get("dueDate"));
            var options = {hour: "numeric", minute: "numeric"};
            var dateString = dueDate.toLocaleTimeString("en-US", options);
            options = {weekday: "short", year: "numeric", month: "numeric", day: "numeric"};
            dateString += ", " + dueDate.toLocaleDateString("en-US", options);;
            var tooltip = "Due at " + dueDate.toString();
            data.dueDate = '<span '
                + ' data-toggle="tooltip"'
                + ' data-placement="auto top"'
                + ' data-original-title="' + tooltip + '"'
                + '>';
            data.dueDate += 'Due&nbsp;Date: ';
            data.dueDate += '<strong>';
            data.dueDate += dateString;
            data.dueDate += '</strong>';
            data.dueDate += '</span>';

            data.questionList = [];
            var qData = this.model.get("qData");
            var qParams = this.test.get("qParams");
            var qids = that.test.get("qids");
            _(qids).each(function(qid, index) {
                var q = that.questions.get(qid);
                data.questionList.push({
                    qid: q.get("qid"),
                    tid: that.model.get("tid"),
                    tiid: that.model.get("tiid"),
                    title: q.get("title"),
                    number: index + 1,
                    fullNumber: "#" + hwNumber + "-" + (index + 1),
                    value: GameTestHelper.renderQuestionValue(qData[qid].value, qParams[qid].initValue),
                    score: GameTestHelper.renderQuestionScore(qData[qid].score, qParams[qid].maxScore),
                });
            });
            var html = Mustache.render(GameTestInstanceViewTemplate, data);
            this.$el.html(html);
            this.$('[data-toggle=tooltip]').tooltip();
        },

        close: function() {
            this.remove();
        }
    });

    return GameTestInstanceView;
});
