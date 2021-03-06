
define(["underscore", "backbone", "mustache", "AdaptiveTestHelper", "text!AdaptiveTestInstanceView.html"], function(_, Backbone, Mustache, AdaptiveTestHelper, AdaptiveTestInstanceViewTemplate) {

    var AdaptiveTestInstanceView = Backbone.View.extend({

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
            data.masteryScore = AdaptiveTestHelper.renderMasteryScore(modelData);
            data.masteryBar = AdaptiveTestHelper.renderMasteryBar(modelData);
            data.hwScore = AdaptiveTestHelper.renderHWScore(this.model, testOptions);
            var score = this.model.get("score");
            data.scoreBar = AdaptiveTestHelper.renderScoreBar(score);

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
            var qids = that.test.get("qids");
            var qDists = that.test.get("qDists");
            var userDist = that.model.get("dist");
            _(qids).each(function(qid, index) {
                var q = that.questions.get(qid);
                data.questionList.push({
                    qid: q.get("qid"),
                    tid: that.model.get("tid"),
                    tiid: that.model.get("tiid"),
                    title: q.get("title"),
                    number: index + 1,
                    fullNumber: "#" + hwNumber + "-" + (index + 1),
                    recommendBar: AdaptiveTestHelper.renderRecommendBar(modelData, qid),
                    correctPoints: AdaptiveTestHelper.renderCorrectPoints(modelData, qid),
                    incorrectPoints: AdaptiveTestHelper.renderIncorrectPoints(modelData, qid),
                    attempts: AdaptiveTestHelper.renderAttempts(modelData, qid)
                });
            });
            var html = Mustache.render(AdaptiveTestInstanceViewTemplate, data);
            this.$el.html(html);
            this.$('[data-toggle=tooltip]').tooltip();
        },

        close: function() {
            this.remove();
        }
    });

    return AdaptiveTestInstanceView;
});
