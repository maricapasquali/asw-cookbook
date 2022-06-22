<template>
  <div :id="commentId">
    <wrap-loading v-model="updatingOrDeleting.process">
      <!-- Modal for reporting-->
      <b-modal
        v-model="showReportComment"
        title="Segnala commento"
        centered
        ok-only
        @ok="report"
      >
        <p>Vuoi segnalare il commento di <strong>{{ comment.user | username }}</strong>?</p>
      </b-modal>

      <!-- Modal for reporting-->
      <b-modal
        v-model="showDeleteComment"
        title="Cancella commento"
        centered
        ok-only
        @ok="removeComment"
      >
        <p>Vuoi cancellare il tuo commento ?</p>
      </b-modal>

      <b-container :class="classComment">
        <b-row
          class="comment-user"
          align-v="center"
        >
          <b-col
            cols="auto"
            class="px-0"
          >
            <avatar
              :value="isThereProfileImg"
              :size="40"
              :user="comment.user && comment.user._id"
              :user-id="userID"
              user-id-class="text-white"
              :link="!!comment.user"
            />
          </b-col>
        </b-row>

        <b-row
          class="comment-popover"
          cols="1"
        >
          <b-col class="comment-content mt-1">
            <mini-text-editor
              v-model="changeMode"
              :content="comment.content"
              @end-edit="changeComment"
            >
              <template #edit>
                Salva
              </template>
            </mini-text-editor>
            <b-container
              v-if="!changeMode"
              fluid
              class="px-0"
            >
              <b-row
                v-if="isDeletedComment"
                class="mb-2"
              >
                <b-col><font-awesome-icon icon="ban" /> <span>Commento cancellato.</span></b-col>
              </b-row>
              <b-row
                v-else-if="isReportedComment"
                class="mb-2"
                cols="1"
                align-v="center"
              >
                <b-col><b-icon-exclamation-triangle-fill /> <span>Commento segnalato.</span> </b-col>
                <b-col class="text-left pl-1">
                  <b-button
                    variant="link"
                    @click="showReportedComment"
                  >
                    Visualizza comunque
                  </b-button>
                </b-col>
              </b-row>
              <b-row v-else>
                <b-col><span>{{ comment.content }}</span></b-col>
              </b-row>
            </b-container>
          </b-col>

          <b-col
            v-if="!isDeletedComment && !isReportedComment"
            class="comment-footer px-0"
          >
            <b-container
              fluid
              class="my-2"
            >
              <b-row
                cols="1"
                cols-sm="2"
                align-v="center"
              >
                <b-col class="text-left pr-0">
                  <small class="timestamp">{{ comment.timestamp | date }}</small>
                </b-col>
                <b-col
                  v-if="youCanCommentOrReport"
                  class="text-right pr-1"
                >
                  <b-button-group class="actions">
                    <b-button
                      title="Mi piace"
                      variant="link"
                    >
                      <like
                        :value="comment.likes"
                        :recipe="recipe"
                        :comment="comment"
                        :no-like="youNotMakeLike"
                        variant="light"
                        @input="$set(comment, 'likes', $event)"
                      />
                    </b-button>
                    <b-button
                      title="Segnala commento"
                      variant="link"
                      @click="showReportComment = true"
                    >
                      <b-icon-flag-fill variant="danger" />
                    </b-button>
                    <b-button
                      :ref="editorCommentId"
                      v-b-toggle="editorCommentId"
                      title="Rispondi al commento"
                      variant="link"
                    >
                      <b-icon-reply-fill variant="success" />
                    </b-button>
                  </b-button-group>
                </b-col>
                <b-col
                  v-if="isOwnerComment"
                  class="text-right"
                >
                  <b-button-group>
                    <like
                      :value="comment.likes"
                      :recipe="recipe"
                      :comment="comment"
                      :no-like="youNotMakeLike"
                      variant="light"
                      @input="$set(comment, 'likes', $event)"
                    />
                    <b-button
                      v-if="!changeMode"
                      title="Modifica commento"
                      variant="link"
                      @click="changeMode = true"
                    >
                      <b-icon-pencil-square variant="primary" />
                    </b-button>
                    <b-button
                      title="Cancella commento"
                      variant="link"
                      @click="showDeleteComment = true"
                    >
                      <b-icon-trash-fill variant="danger" />
                    </b-button>
                  </b-button-group>
                </b-col>
              </b-row>
            </b-container>
            <b-collapse
              v-if="youCanCommentOrReport"
              :id="editorCommentId"
              class="col"
            >
              <wrap-loading v-model="responding.process">
                <mini-text-editor
                  :reset-content="responding.success"
                  @end-edit="addResponse"
                  @close="closeEditorResponse"
                >
                  <template #edit>
                    Rispondi
                  </template>
                </mini-text-editor>
              </wrap-loading>
            </b-collapse>
          </b-col>
        </b-row>

        <b-row
          v-if="hasResponses"
          cols="1"
        >
          <b-col class="text-right px-0">
            <b-button
              v-b-toggle="responsesCommentId"
              class="toggle-conversation"
              variant="link"
            >
              {{ showConversation ? 'Nascondi': 'Visualizza' }} conversazione
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </wrap-loading>

    <b-collapse
      :id="responsesCommentId"
      v-model="showConversation"
    >
      <div
        v-if="hasResponses"
        class="responses"
      >
        <comment
          v-for="response in comment.responses"
          :key="response._id"
          :comment="response"
          :recipe="recipe"
          :path-hash-comment="pathHashComment"
        />
      </div>
    </b-collapse>
  </div>
</template>
<script>

import { UserMixin } from "@mixins"
import { mapGetters } from "vuex"

export default {
    name: "Comment",
    mixins: [UserMixin],
    props: {
        comment: {
            type: Object,
            required: true
        },
        recipe: {
            type: Object,
            required: true
        },

        pathHashComment: {
            type: Array,
            default() {
                return []
            }
        },
    },
    data() {
        return {
            showReportComment: false,
            showDeleteComment: false,

            showConversation: false,

            changeMode: false,

            responding: {
                process: false,
                success: null
            },
            updatingOrDeleting: {
                process: false,
                success: null
            }
        }
    },
    computed:{
        userID() {
            return this.comment.user?.userID || "Anonimo"
        },

        responsesCommentId() {
            return "responses-comment-"+ this.comment._id
        },
        hasResponses() {
            return this.comment.responses && this.comment.responses.length
        },
        commentId() {
            return "comment-"+ this.comment._id
        },
        editorCommentId() {
            return "editor-" + this.comment._id
        },
        isThereProfileImg() {
            return this.comment.user && this.comment.user.img
        },

        isOwnerComment() {
            return this.comment.user && this.comment.user._id === this.userIdentifier
        },

        youNotMakeLike() {
            return this.isAdmin || this.isOwnerComment || !this.recipe.owner
        },

        youCanCommentOrReport() {
            return !this.isAdmin && !this.isOwnerComment && this.recipe.owner
        },

        isDeletedComment() {
            return !this.comment.content || this.comment.content.length === 0
        },
        isReportedComment() {
            return this.comment.reported !== false
        },

        ...mapGetters({
            userIdentifier: "session/userIdentifier",
            username: "session/username",
            isAdmin: "session/isAdmin",
            isLoggedIn: "session/isLoggedIn"
        }),

        classComment() {
            return {
                "comment": true,
                "deleted-comment": this.isDeletedComment,
                "reported-comment": this.isReportedComment,
            }
        }

    },
    created() {
        this.$bus.$on("comment:report", this.renderReportedComment.bind(this))
        this.$bus.$on("comment:response",  this.renderResponseComment.bind(this))

        this.$bus.$on("comment:update",  this.renderUpdateComment.bind(this))
        this.$bus.$on("comment:delete",  this.renderDeleteComment.bind(this))
        this.$bus.$on("comment:unreport",  this.renderUnreportedComment.bind(this))

        this.$bus.$on("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$on("user:delete", this.onDeletedUserListeners.bind(this))

        this.showConversation = !!this.pathHashComment.find(c => c === this.comment._id)
        console.debug("comment ", this.comment._id, " showConversation ", this.showConversation)
    },
    beforeDestroy() {
        this.$bus.$off("comment:report", this.renderReportedComment.bind(this))
        this.$bus.$off("comment:response", this.renderResponseComment.bind(this))

        this.$bus.$off("comment:update", this.renderUpdateComment.bind(this))
        this.$bus.$off("comment:delete", this.renderDeleteComment.bind(this))
        this.$bus.$off("comment:unreport", this.renderUnreportedComment.bind(this))

        this.$bus.$off("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$off("user:delete", this.onDeletedUserListeners.bind(this))
    },
    methods:{
    /* REPORT */
        showReportedComment() {
            this.$set(this.comment, "reported", false)
            this.$emit("show-reported-comment")
            console.debug("Show Reported comment.")
        },

        report() {
            this.$store.dispatch("comments/report", { ownerID: this.recipe.owner._id, recipeID: this.recipe._id, commentID: this.comment._id })
                .then(({ status }) => {
                    this.$set(this.comment, "reported", true)
                    this.$emit("reporting", this.comment)
                    if (status === 200) {
                        const _comment = clone(this.comment)
                        this.$socket.emit("comment:report",
                            Object.assign(_comment, { recipe: { _id: this.recipe._id, name: this.recipe.name, owner: this.recipe.owner } }),
                            this.isLoggedIn ? { _id: this.userIdentifier, userID: this.username }: undefined)
                    }
                })
                .catch(this.$store.$api.errorsHandler.comments.updateComment)
        },

        /*RESPONSE*/
        closeEditorResponse() {
            let editorBtn = this.$refs[ this.editorCommentId ]
            if (editorBtn) editorBtn.click()
        },
        addResponse(text) {
            this.responding.process = true
            this.$store.dispatch("comments/response", { ownerID: this.recipe.owner._id, recipeID: this.recipe._id, commentID: this.comment._id, content: text })
                .then(({ data }) => {
                    this.$set(this.comment, "responses", [...this.comment.responses, data])
                    console.debug("You answered.")
                    this.$emit("add-response", data)
                    this.showConversation = true

                    const _comment = clone(this.comment)
                    this.$socket.emit("comment:response", Object.assign(_comment,
                        { recipe: { _id: this.recipe._id, name: this.recipe.name, owner: this.recipe.owner } }), data)
                    return true
                })
                .catch(this.$store.$api.errorsHandler.comments.createCommentOrResponse)
                .then(success => this.responding = { process: false, success })
        },

        /*CHANGE CONTENT COMMENT*/
        changeComment(newContent) {
            if (this.comment.content !== newContent) {
                this.updatingOrDeleting.process = true
                this.$store.dispatch("comments/update", {
                    ownerID: this.recipe.owner._id,
                    recipeID: this.recipe._id,
                    commentID: this.comment._id,
                    content: newContent
                })
                    .then(({ data }) => {
                        console.debug("Update comment = ", data)
                        this.$set(this.comment, "content", newContent)

                        this.$socket.emit("comment:update", this.comment)
                        this.changeMode = false
                        return true
                    })
                    .catch(this.$store.$api.errorsHandler.comments.updateComment)
                    .then(success => this.updatingOrDeleting = { process: false, success })
            }
        },

        /* REMOVE COMMENT*/
        removeComment() {
            this.updatingOrDeleting.process = true

            this.$store.dispatch("comments/remove", { ownerID: this.recipe.owner._id, recipeID: this.recipe._id, commentID: this.comment._id } )
                .then(() => {
                    this.$set(this.comment, "content", "")
                    this.$emit("remove", this.comment)
                    this.$socket.emit("comment:delete", this.comment._id)
                    return true
                })
                .catch(this.$store.$api.errorsHandler.comments.deleteComment)
                .then(success => this.updatingOrDeleting = { process: false, success })
        },

        /* Listeners notification */
        renderReportedComment(commentID) {
            if (this.comment._id === commentID) this.$set(this.comment, "reported", true)
        },
        renderResponseComment(notification, response) {
            if (response && this.comment._id === response.comment) pushIfAbsent(this.comment.responses, response.data)
        },

        /* Listeners update */
        renderUpdateComment(_comment) {
            if (_comment && _comment._id === this.comment._id) this.$set(this.comment, "content", _comment.content)
        },
        renderDeleteComment(commentID) {
            if (commentID === this.comment._id) this.$set(this.comment, "content", "")
        },
        renderUnreportedComment(commentID) {
            if (this.comment._id === commentID) this.$set(this.comment, "reported", false)
        },

        onUpdateInfos(userInfo) {
            if (this.comment.user && userInfo && this.comment.user._id === userInfo._id) this._updateUserInformation(this.comment.user, userInfo)
        },
        onDeletedUserListeners(id) {
            if (this.comment.user && this.comment.user._id === id)  this.$set(this.comment, "user", null)
        }
    }
}
</script>

<style lang="scss" scoped>
$comment-bg-color: #fff;

.responses {
  border: 1px solid lightgrey;
  border-radius: 1.25rem;
  padding: 1%;
}

.comment {
  margin-top: 1.25rem;

  & .comment-user {
    position: relative;
    padding-left: 13px;

    & > div {
      & > a {
        color: white;
      }
    }

    &::after {
      border: 1em solid transparent;
      border-top-color: $comment-bg-color;
      content: "";
      margin-left: 5em;
      position: absolute;
      top: 44%;
      left: -63px;
      width: 0;
      height: 0;
      transform: rotate(180deg);
    }
  }

  & .comment-popover {
    border: 1px solid lightgrey;
    border-radius: 10px;
    margin-top: 7px;
    background-color: $comment-bg-color;
    color: black;

    & .footer {
      margin-top: 10px;
      border-radius: 10px;

      & .timestamp {
        float: left;
        padding-right: 10px;
      }

      & .actions {
        & button {
          padding-left: 0;
        }
      }
    }
  }

  button.toggle-conversation {
    color: white;
  }
}

$comments-bg-colors: (reported: #dcdcdc, deleted: #b4c2d0);

@each $type, $bg in $comments-bg-colors {
  @debug $type, $bg;
  .#{$type}-comment {
    & .comment-user {
      &::after {
        border-top-color: $bg !important;
      }
    }

    & .comment-popover {
      background-color: $bg !important;
      border-color: $bg !important;
    }
  }
}

</style>
