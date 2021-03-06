
define(["underscore", "backbone", "mustache", "BasicTestHelper", "text!BasicTestInstanceView.html"], function(_, Backbone, Mustache, BasicTestHelper, BasicTestInstanceViewTemplate) {

    var BasicTestInstanceView = Backbone.View.extend({

        tagName: 'div',

        initialize: function() {
            this.test = this.options.test;
            this.questions = this.options.questions;
            this.listenTo(this.model, "change", this.render);
            this.listenTo(this.test, "change", this.render);
        },

        render: function() {
            var that = this;
            var data = {};
            data.title = this.test.get("title");
            var hwNumber = this.test.get("number");
            data.number = hwNumber;
            data.set = this.test.get("set");
            data.tiid = this.model.get("tiid");

            var dueDate = new Date(this.test.get("dueDate"));
            data.dueDate = BasicTestHelper.renderDueDate(dueDate);

            var score = this.model.get("score");
            data.score = BasicTestHelper.renderHWScore(score);
            data.scoreBar = BasicTestHelper.renderScoreBar(score);

            data.questionList = [];
            var qids = this.test.get("qids");
            var qData = this.model.get("qData");
            _(qids).each(function(qid, index) {
                var q = that.questions.get(qid);
                data.questionList.push({
                    qid: q.get("qid"),
                    tid: that.model.get("tid"),
                    tiid: that.model.get("tiid"),
                    title: q.get("title"),
                    number: index + 1,
                    fullNumber: "#" + hwNumber + "-" + (index + 1),
                    attempts: BasicTestHelper.renderQAttempts(qData[qid]),
                    score: BasicTestHelper.renderQScore(qData[qid]),
                });
            });
            var html = Mustache.render(BasicTestInstanceViewTemplate, data);
            this.$el.html(html);
            this.$('[data-toggle=tooltip]').tooltip();
        },

        close: function() {
            this.remove();
        }
    });

    return BasicTestInstanceView;
});
